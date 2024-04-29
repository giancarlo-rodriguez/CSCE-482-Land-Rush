import io
import math
import numpy as np
import matplotlib.pyplot as plt

from shapely.geometry import Polygon
from shapely.geometry import Point
from shapely.prepared import prep
from queue import Queue
from collections import deque


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

class Organization:
    def __init__(self, name, average_req_time, member_count):
        self.name = name
        self.req_time = average_req_time
        self.member_count = member_count
        self.sqft = 0

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


def algorithm(section_coords, orgs_attending, org_names):
    """
        Run the algorithm that partitions a section into plots for individual organizations.
        Args:   section_coords - coordinates of the section in (longitude, latitude)
                org_names
                req_times
                member_count
    """
    print("entered algo")
    section_area = calcSectionArea(section_coords)
    section_occupancy = section_area / SQFT_PER_PERSON

    total_orgs = []
    orgs = []
    for org in orgs_attending:
        members = orgs_attending[org][0]
        time = orgs_attending[org][1]
        total_orgs.append(Organization(org, time / members, members))
    total_orgs = sorted(total_orgs, key=lambda organization: getattr(organization, 'req_time'))
    print("algo 2")
    total_member_count = 0
    for org in total_orgs:
        if total_member_count + org.member_count <= section_occupancy:
            orgs.append(org)
            print(org.member_count)
    print("total membercount:",total_member_count)
    print("algo 2")
    calcSqftPerOrg(section_area, orgs)
    polygon = createPolygon(section_coords)
    grid, valid = createGrid(polygon)
    print("algo 3")
    def bfs(start, name, grid, visited, allocated, cells_needed):
        """
        Run BFS on an orgnization, allocating the necessary square footage.
        Args:   start - start position (x,y)
                name - name of the organization being allocated
                grid - the 2d matrix on top of the image
                visited - the cells that have been visited by BFS
                allocated - 2d matrix showing which cells have been allocated
                cells_needed - the cells needed to get neeeded square footage for the org
        """

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
    print("algo 4")
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
            rect = plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='none', facecolor='none')
            ax.add_patch(rect)
            if point == (38,51):
                ax.add_patch(plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='none', facecolor="Black"))
            if point in allocated:
                org_name = allocated[point]
                color = org_colors[org_name]
                ax.add_patch(plt.Rectangle((x - CELL_SIZE / 2, y - CELL_SIZE / 2), CELL_SIZE, CELL_SIZE, linewidth=0, edgecolor='none', facecolor=color))
    print("algo 5")
    # Show plot
    legend_handles = []
    for org_id, org_name in org_names.items():
        color = org_colors.get(org_id, [0, 0, 0])
        legend_handles.append(plt.Rectangle((0, 0), 1, 1, fc=color, edgecolor='none'))
    ax.legend(legend_handles, org_names.values(), loc='upper right')
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_data = buffer.read() # Read the image data from the buffer
    plt.close(fig)  # Close the figure to free up resources
    print("algo exited")
    return image_data