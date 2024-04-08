import math
import numpy as np
import matplotlib.pyplot as plt
from shapely.geometry import Polygon, Point
from queue import Queue

class Organization:
    def __init__(self, name, square_footage):
        self.name = name
        self.square_footage = square_footage

def create_polygon(shape_coords):
    # Create a Shapely polygon from the shape coordinates
    return Polygon(shape_coords)

# def create_grid(polygon, cell_size):
#     minx, miny, maxx, maxy = polygon.bounds
#     lat_range = maxy - miny
#     lon_range = maxx - minx

#     num_lat_cells = math.ceil(lat_range / cell_size)
#     num_lon_cells = math.ceil(lon_range / cell_size)

#     grid = []
#     for i in range(num_lat_cells):
#         lat = miny + i * cell_size
#         row = []
#         for j in range(num_lon_cells):
#             lon = minx + j * cell_size
#             point = (lon + cell_size / 2, lat + cell_size / 2)  # Center of the grid cell
#             if polygon.contains(Point(point)):  # Check if the grid point is inside the polygon
#                 row.append(point)
#         if row:
#             grid.append(row)

#     return grid
def create_grid(polygon, cell_size_feet, ref_lat, ref_lon):
    # Convert feet to meters (1 foot = 0.3048 meters)
    cell_size_meters = cell_size_feet * 0.3048

    minx, miny, maxx, maxy = polygon.bounds
    lat_range = maxy - miny
    lon_range = maxx - minx

    # Convert reference point to meters
    ref_x, ref_y = convert_to_xy(ref_lat, ref_lon, ref_lat, ref_lon)

    num_lat_cells = math.ceil(lat_range / cell_size_meters)
    num_lon_cells = math.ceil(lon_range / cell_size_meters)

    grid = []
    for i in range(num_lat_cells):
        lat = miny + i * cell_size_meters
        row = []
        for j in range(num_lon_cells):
            lon = minx + j * cell_size_meters
            x, y = convert_to_xy(lat, lon, ref_lat, ref_lon)
            point = (ref_x + x + cell_size_meters / 2, ref_y + y + cell_size_meters / 2)  # Center of the grid cell
            if polygon.contains(Point(lon, lat)):  # Check if the grid point is inside the polygon
                row.append(point)
        if row:
            grid.append(row)

    return grid

def allocate_space(grid, organizations):
    allocated = {}
    for org in organizations:
        name = org.name
        square_footage = org.square_footage
        num_squares_allocated = 0
        # Calculate the number of grid squares needed for the organization
        num_squares_needed = math.ceil(square_footage / (cell_size_meters))
        for row_index, row in enumerate(grid):
            for col_index, cell in enumerate(row):
                if (row_index, col_index) not in allocated:
                    # Check if space requirement can be fulfilled starting from this cell
                    num_squares_allocated, allocated = allocate_space_for_org(grid, row_index, col_index, num_squares_needed, name, allocated, num_squares_allocated)
                    if num_squares_needed == num_squares_allocated:
                        break
            else:
                continue
            break
    return allocated

def allocate_space_for_org(grid, start_row_index, start_col_index, num_squares_needed, name, allocated, num_squares_allocated):
    
    for i in range(start_row_index, -1, -1):  # Start from the current row and move up
        for j in range(start_col_index, -1, -1):  # Start from the current column and move left
            left_neighbor = (i, j - 1)
            left_org = allocated.get(left_neighbor)
            # Check if the right neighbor belongs to a different organization
            right_neighbor = (i, j + 1)
            right_org = allocated.get(right_neighbor)
            
            if (i, j) not in allocated:
                if num_squares_allocated > 0 and left_org != None and left_org != name and (j == len(grid[i])-1):
                    continue
                allocated[(i, j)] = name
                num_squares_allocated += 1

                if num_squares_allocated == num_squares_needed:
                    return num_squares_allocated, allocated
                if i + 1 >= len(grid):
                        continue
                if num_squares_allocated < num_squares_needed and (j == len(grid[i])-1 or (right_org != None and left_org != None and right_org != name and left_org != name)):
                    start_col_index = len(grid[i+1])-1
                    
                    for j in range(start_col_index, -1, -1):  # Start from the end of the row and move left
                        
                        if (i + 1, j) not in allocated:
                            allocated[(i + 1, j)] = name
                            num_squares_allocated += 1
                            if num_squares_allocated == num_squares_needed:
                                return num_squares_allocated, allocated
    return num_squares_allocated, allocated


import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius of the Earth in meters

    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c

    return distance

def convert_to_xy(lat, lon, ref_lat, ref_lon):
    # Convert latitude and longitude differences to meters
    lat_diff_meters = haversine(ref_lat, ref_lon, lat, ref_lon)
    lon_diff_meters = haversine(ref_lat, ref_lon, ref_lat, lon)

    # Adjust signs based on direction
    if lat < ref_lat:
        lat_diff_meters *= -1
    if lon < ref_lon:
        lon_diff_meters *= -1

    return lat_diff_meters, lon_diff_meters


shape_coordinates = [
    (30.612643346426243, -96.34365561917583),
    (30.6126064122004, -96.34308162644665),
    (30.612754149019423, -96.34270075276653),
    (30.613631331740105, -96.34145620778362),
    (30.614637773704093, -96.34231987908642),
    (30.61346512930847, -96.34403112843792),
    (30.613225058625773, -96.34414914563457),
    (30.61284417603297, -96.34426716283123)
]

# Convert shape coordinates to a Shapely polygon

polygon = create_polygon(shape_coordinates)


if polygon.is_valid:
    # Define the size of the grid cells in feet
    cell_size_feet = 7

    # Convert feet to meters (1 foot = 0.3048 meters)
    cell_size_meters = cell_size_feet * 0.3048

    # Generate grid
    avg_lat = sum(lat for lat, lon in shape_coordinates) / len(shape_coordinates)
    avg_lon = sum(lon for lat, lon in shape_coordinates) / len(shape_coordinates)
    grid = create_grid(polygon, cell_size_feet, avg_lat, avg_lon)

    # Define organizations with their square footage requirements
    organizations = [Organization("Org1", 7 * 0.3048), Organization("Org23", 14 * 0.3048), Organization("Org2", 20* 0.3048),  Organization("Org6", 21 * 0.3048), Organization("Org4", 35 * 0.3048)]

    # Allocate space for organizations
    allocated = allocate_space(grid, organizations)

    # Plotting

    # Plotting
    fig, ax = plt.subplots()

    # Plot the polygon
    x, y = polygon.exterior.xy
    ax.plot(x, y, color='blue', alpha=0.5)

    # Dictionary to store colors for each organization
    org_colors = {}

    # Plot the grid
    for row_index, row in enumerate(grid):
        for col_index, cell in enumerate(row):
            x, y = cell
            rect = plt.Rectangle((x - cell_size_meters / 2, y - cell_size_meters / 2), cell_size_meters, cell_size_meters, linewidth=0.5, edgecolor='black', facecolor='none')
            ax.add_patch(rect)
            if (row_index, col_index) in allocated:
                org_name = allocated[(row_index, col_index)]
                if org_name not in org_colors:
                    org_colors[org_name] = np.random.rand(3,)  # Generate a random color for the organization
                color = org_colors[org_name]
                ax.add_patch(plt.Rectangle((x - cell_size_meters / 2, y - cell_size_meters / 2), cell_size_meters, cell_size_meters, linewidth=0, edgecolor='none', facecolor=color))
                ax.text(x - cell_size_meters / 4, y, f"{row_index},{col_index}", fontsize=8, ha='center', va='center')

    # Set axis limits
    ax.set_xlim(polygon.bounds[0] - 10, polygon.bounds[2] + 10)
    ax.set_ylim(polygon.bounds[1] - 10, polygon.bounds[3] + 10)

    # Show plot
    plt.gca().set_aspect('equal', adjustable='box')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.title('Shape with Grid and Allocated Organizations')
    plt.grid(True)
    plt.show()
else:
    print("The polygon is not valid.")