import math
import numpy as np
import matplotlib.pyplot as plt
from shapely.geometry import Polygon
from shapely.geometry import Point
from shapely.prepared import prep
from queue import Queue


# CONSTANTS
EARTH_RADIUS_IN_METERS = 6367460.0
METERS_PER_DEGREE = 2.0 * math.pi * EARTH_RADIUS_IN_METERS / 360.0
RADIANS_PER_DEGREE = math.pi / 180.0
FEET_PER_METER = 3.2808399
SQFT_PER_PERSON = 7
# Multiply by the number of people per cell to get less cells, make faster
CELL_WIDTH = math.sqrt(7)
CELL_AREA = CELL_WIDTH * CELL_WIDTH
# Multiply by the number of people per cell to get less cells, make faster
CELL_SIZE = 7.817467317819993e-06
# divide sqft by this to get the shapely area
SQFT_TO_SHAPE_AREA = 114418286841.2996
FT_TO_SHAPE_DIST = math.sqrt(SQFT_TO_SHAPE_AREA)

section_coords = [
    (30.607906710335737, -96.345868662483245),
    (30.607274178848026, -96.34530003421388),
    (30.606925592211482, -96.34579356063634),
    (30.606874804649784, -96.34600813734177),
]

class Organization:
    def __init__(self, name, average_req_time, member_count):
        self.name = name
        self.req_time = average_req_time
        self.member_count = member_count
        self.sqft = 0

orgs = [
    Organization("A", 1, 50),
    Organization("B", 2, 10),
    Organization("C", 3, 20),
    Organization("D", 4, 15),
    Organization("E", 5, 5),
]


def calcSectionArea(coords):
    """
        Calculate the area of a section in square feet
        Args:   coords - coordinates of section vertices [(lat, long)]
    """
    a = 0.0
    for i in range(len(coords)):
        j = (i+1) % len(coords)
        xi = coords[i][1] * METERS_PER_DEGREE * math.cos(coords[i][0] * RADIANS_PER_DEGREE)
        yi = coords[i][0] * METERS_PER_DEGREE
        xj = coords[j][1] * METERS_PER_DEGREE * math.cos(coords[j][0] * RADIANS_PER_DEGREE)
        yj = coords[j][0] * METERS_PER_DEGREE
        a += ((xi * yj) - (xj * yi))

    section_area = abs(a / 2.0) * FEET_PER_METER * FEET_PER_METER
    return section_area


def calcSqftPerOrg(section_area, organizations):
    """
        Calculate the square footage needed for each organization in an event
        Args:   section_area - Area of the section in sqft
                organizations - List of Organization objects
    """
    total_attendance = sum(org.member_count for org in organizations)
    total_area = total_attendance * SQFT_PER_PERSON
    section_occupancy = section_area / SQFT_PER_PERSON

    if total_attendance < section_occupancy:
        for org in organizations:
            org.sqft = (org.member_count * SQFT_PER_PERSON) * (section_area / total_area)

section_area = calcSectionArea(section_coords)
calcSqftPerOrg(section_area, orgs)


def createPolygon(section_coords):
    return Polygon(section_coords)


def createGrid(polygon):
    """
        Create the grid to be used in paritioning section
        Args:   polygon - The section in shapely
    """
    # calculate the number of cells needed
    minx, miny, maxx, maxy = polygon.bounds
    lat_range = maxy - miny
    lon_range = maxx - minx
    num_y_cells = math.ceil(lat_range / CELL_SIZE)
    num_x_cells = math.ceil(lon_range / CELL_SIZE)

    valid = {}
    grid = []
    for i in range(num_y_cells):
        lat = miny + (i * CELL_SIZE)
        row = []
        for j in range(num_x_cells):
            lon = minx + (j * CELL_SIZE)
            point = (lon + CELL_SIZE / 2, lat + CELL_SIZE / 2)  # Center of the grid cell
            row.append(point)
            if polygon.contains(Point(point)):  # Check if the grid point is inside the polygon
                valid[(i, j)] = True
            else:
                valid[(i, j)] = False
        if row:
            grid.append(row)
    return grid, valid
   

def splitSection(grid, organizations):
    """
        Allocate the space in the grid to each organization
        Args:   grid - Grid containing the section shape
                organizations - List of orgs to be allocated
    """
    allocated = {}
    for org in organizations:
        cells_allocated = 0
        cells_needed = math.ceil(org.sqft / CELL_AREA)

        for row_idx, row in enumerate(grid):
            for col_idx, cell in enumerate(row):
                point = (row_idx, col_idx)
                if valid[point] and (point not in allocated):
                    cells_allocated, allocated = allocateSpaceForOrg(grid, valid, row_idx, col_idx, cells_needed, cells_allocated, org.name, allocated)
            else:
                continue
            break
    return allocated


def allocateSpaceForOrg(grid, valid, start_row_idx, start_col_idx, cells_needed, cells_allocated, name, allocated):
    """
        Allocate space needed for an individual org
        Args:   grid - Grid containing the section shape
                valid - Dict that maps grid points to whether they're in the section
                start_row_idx - index to start from
                start_col_idx - inex to start from
                cells_needed - cells needed by one org
                cells_allocated - cells allocated so far
                name - name of org
                allocated - Dict that maps grid points to whether they've been allocated
    """
    for i in range(start_row_idx, -1, -1):  # Start from the current row and move up
        for j in range(start_col_idx, -1, -1):  # Start from the current column and move left
            point = (i, j)
            if cells_allocated == cells_needed:
                return cells_allocated, allocated

            if not(valid[point]) or (point in allocated):
                continue
            
            allocated[point] = name
            cells_allocated += 1

    return cells_allocated, allocated


polygon = createPolygon(section_coords)


if not polygon.is_valid:
    print("The polygon is not valid.")
else:
    grid, valid = createGrid(polygon)
    allocated = splitSection(grid, orgs)

    # Plotting
    fig, ax = plt.subplots()
    x, y = polygon.exterior.xy
    ax.plot(x, y, color='blue', alpha=0.5)

    org_colors = {}
    for row_idx, row in enumerate(grid):
        for col_idx, cell in enumerate(row):
            point = (row_idx, col_idx)
            x, y = cell
            rect = plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='black', facecolor='none')
            ax.add_patch(rect)
            if point in allocated:
                org_name = allocated[point]
                if org_name not in org_colors:
                    org_colors[org_name] = np.random.rand(3,)  # Generate a random color for the organization
                color = org_colors[org_name]
                ax.add_patch(plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='none', facecolor=color))
                # ax.text(x - CELL_SIZE / 4, y, f"{org_name}", fontsize=8, ha='center', va='center')

    # Show plot
    plt.gca().set_aspect('equal', adjustable='box')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.title('Shape with Grid and Allocated Organizations')
    # plt.grid(True)
    plt.show()
