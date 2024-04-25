import math
import numpy as np
import matplotlib.pyplot as plt
from shapely.geometry import Polygon
from shapely.geometry import Point
from shapely.prepared import prep
from queue import Queue
from collections import deque
import io
# COORDS (LAT, LONG)
# DICT (ORG ID: (member count, total time))

# CONSTANTS
EARTH_RADIUS_IN_METERS = 6367460.0
METERS_PER_DEGREE = 2.0 * math.pi * EARTH_RADIUS_IN_METERS / 360.0
RADIANS_PER_DEGREE = math.pi / 180.0
FEET_PER_METER = 3.2808399
SQFT_PER_PERSON = 7
CELL_WIDTH = math.sqrt(7)
CELL_AREA = CELL_WIDTH * CELL_WIDTH
CELL_SIZE = 7.817467317819993e-06
SQFT_TO_SHAPE_AREA = 114418286841.2996
FT_TO_SHAPE_DIST = math.sqrt(SQFT_TO_SHAPE_AREA)

colors = [
    [0.7, 0.0, 0.0], # Red
    [0.0, 0.0, 0.8], # Blue
    [0.8, 0.8, 0.0], # Yellow
    [0.0, 0.6, 0.0], # Green
    [0.5, 0.0, 0.5], # Purple
    [0.5, 0.5, 0.5], # Gray
    [0.9, 0.5, 0.0], # Orange
    [0.0, 0.3, 0.0], # Forest
    [0.9, 0.7, 0.8], # Pink
    [0.3, 0.2, 0.1], # Brown
    [0.0, 0.7, 0.7], # Cyan
]

# LONGITUDE, LATITUDE
# SECTION 1
# section_coords = [
#     (-96.345868662483245, 30.607906710335737),
#     (-96.34530003421388, 30.607274178848026),
#     (-96.34579356063634, 30.606925592211482),
#     (-96.34600813734177, 30.606874804649784),
# ]
# section_coords = [
#     (30.607906710335737, -96.345868662483245),
#     (30.607274178848026, -96.34530003421388),
#     (30.606925592211482, -96.34579356063634),
#     (30.606874804649784, -96.34600813734177),
# ]

# SECTION 2
section_coords1 = [
    (-96.34607133776048, 30.608116259627238),
    (-96.3459345450978, 30.607973132735594),
    (-96.34601769357906, 30.607333676136324),
    (-96.3460874310149, 30.60734060168168),
    (-96.3460311046244, 30.60739369751292),
    (-96.34647635133008, 30.60790387771211),
]
# section_coords = [
#     (30.608116259627238, -96.34607133776048),
#     (30.607973132735594, -96.34593454509788),
#     (30.607333676136324, -96.34601769357906),
#     (30.60734060168168, -96.3460874310149),
#     (30.60739369751292, -96.3460311046244),
#     (30.60790387771211, -96.34647635133008),
# ]

class Organization:
    def __init__(self, name, average_req_time, member_count):
        self.name = name
        self.req_time = average_req_time
        self.member_count = member_count
        self.sqft = 0

# orgs = [
#     Organization("A", 1, 69),
#     Organization("B", 2, 47),
#     Organization("C", 3, 25),
#     Organization("D", 4, 17),
#     Organization("E", 5, 10),
#     Organization("F", 6, 10),
# ]
orgs = [
    Organization("A", 1, 15),
    Organization("B", 2, 15),
    Organization("C", 3, 10),
    Organization("D", 4, 10),
    Organization("E", 5, 10),
    Organization("F", 6, 10),
    Organization("G", 7, 10),
    Organization("H", 8, 5),
    Organization("I", 9, 5),
    Organization("J", 10, 5),
    Organization("K", 11, 5),
]

def calcSectionArea(coords):
    """
        Calculate the area of a section in square feet
        Args:   coords - coordinates of section vertices [(lat, long)]
    """
    a = 0.0
    for i in range(len(coords)):
        j = (i+1) % len(coords)
        xi = coords[i][0] * METERS_PER_DEGREE * math.cos(coords[i][1] * RADIANS_PER_DEGREE)
        yi = coords[i][1] * METERS_PER_DEGREE
        xj = coords[j][0] * METERS_PER_DEGREE * math.cos(coords[j][1] * RADIANS_PER_DEGREE)
        yj = coords[j][1] * METERS_PER_DEGREE
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






def createPolygon(section_coords):
    return Polygon(section_coords)


def createGrid(polygon):
    """
        Create the grid to be used in paritioning section
        Args:   polygon - The section in shapely
    """
    # calculate the number of cells needed
    minx, miny, maxx, maxy = polygon.bounds
    lon_range = maxx - minx
    lat_range = maxy - miny
    num_x_cells = math.ceil(lon_range / CELL_SIZE)
    num_y_cells = math.ceil(lat_range / CELL_SIZE)

    valid = {}
    grid = []
    valid_cell = 0
    for y in range(num_y_cells):
        lat = miny + (y * CELL_SIZE)
        row = []
        for x in range(num_x_cells):
            lon = minx + (x * CELL_SIZE)
            point = (lon + CELL_SIZE / 2, lat + CELL_SIZE / 2)  # Center of the grid cell
            row.append(point)
            if polygon.contains(Point(point)):  # Check if the grid point is inside the polygon
                valid[(x, y)] = True
                valid_cell += 1
            else:
                valid[(x, y)] = False
        if row:
            grid.append(row)
    return grid, valid








def algorithm(section_coords):
    polygon = createPolygon(section_coords)
    grid, valid = createGrid(polygon)
    def bfs(start, name, grid, visited, allocated, cells_needed):
        q = deque([(start[0], start[1])])
        cells = 0
        while q:
            x, y = q.popleft()
            for nx, ny in [(x, y - 1), (x + 1, y - 1), (x + 1, y), (x + 1, y + 1), (x, y + 1), (x - 1, y + 1), (x - 1, y), (x - 1, y - 1)]:
                if 0 <= nx < len(grid[0]) and 0 <= ny < len(grid):
                    coord = nx, ny
                    if valid[coord] and coord not in visited:
                        cells += 1
                        visited[coord] = True
                        allocated[coord] = name
                        if cells == cells_needed:
                            return
                        q.append(coord)
    section_area = calcSectionArea(section_coords)
    calcSqftPerOrg(section_area, orgs)

    def splitSection(grid, organizations):
        """
            Allocate the space in the grid to each organization
            Args:   grid - Grid containing the section shape
                    organizations - List of orgs to be allocated
        """
        allocated = {}
        visited = {}
        for org in organizations:
            name = org.name
            breaker = False
            cells_allocated = 0
            cells_needed = math.ceil(org.sqft / CELL_AREA)
            for col_idx, col in enumerate(grid):
                for row_idx, row in enumerate(col):
                    point = (row_idx, col_idx)
                    if valid[point] and (point not in visited):
                        breaker = True
                        bfs(point, name, grid, visited, allocated, cells_needed)
                        break
                if breaker:
                    break
        return allocated
    allocated = splitSection(grid, orgs)
    
    # Plotting
    fig, ax = plt.subplots()
    x, y = polygon.exterior.xy
    ax.plot(x, y, color='blue', alpha=0.5)

    org_colors = {}
    for i, org in enumerate(orgs):
        org_colors[org.name] = colors[i]

    for col_idx, col in enumerate(grid):
        for row_idx, cell in enumerate(col):
            # print("  ",cell)
            point = (row_idx, col_idx)
            x, y = cell
            rect = plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='black', facecolor='none')
            ax.add_patch(rect)
            if point == (38,51):
                ax.add_patch(plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='none', facecolor="Black"))
            if point in allocated:
                org_name = allocated[point]
                # org_colors[]
                # if org_name not in org_colors:
                #     org_colors[org_name] = np.random.rand(3,)  # Generate a random color for the organization
                color = org_colors[org_name]
                ax.add_patch(plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='none', facecolor=color))

    # Show plot
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)

    # Read the image data from the buffer
    image_data = buffer.read()

    plt.close(fig)  # Close the figure to free up resources

    return image_data