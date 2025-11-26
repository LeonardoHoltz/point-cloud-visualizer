import argparse
import numpy as np
from pypcd import pypcd
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Converts a .pcd to a specific compression format.")
    parser.add_argument("file", type=str, help="Input .pcd file")
    parser.add_argument("--compression-type", type=str, help="Compression type to be used in the convertion")
    args = parser.parse_args()
    cloud = pypcd.PointCloud.from_path(args.file)
    
    # Centralize Point Cloud
    xyz = np.vstack([cloud.pc_data['x'], cloud.pc_data['y'], cloud.pc_data['z']]).T
    center = xyz.mean(axis=0)
    xyz_centered = xyz - center
    #scale = np.max(np.linalg.norm(xyz_centered, axis=1))
    #xyz_normalized = xyz_centered / scale
    cloud.pc_data['x'] = xyz_centered[:, 0]
    cloud.pc_data['y'] = xyz_centered[:, 1]
    cloud.pc_data['z'] = xyz_centered[:, 2]
    
    file = Path(args.file)
    if args.compression_type == "ascii":
        pypcd.save_point_cloud(cloud, f"data/ascii_{file.name}")
    elif args.compression_type == "bin":
        pypcd.save_point_cloud_bin(cloud, f"data/bin_{file.name}")
    elif args.compression_type == "bin_compressed":
        pypcd.save_point_cloud_bin_compressed(cloud, f"data/bin_compressed_{file.name}")
    else:
        raise Exception("Non-existent compression type. Use 'ascii', 'bin' or 'bin_compressed'")

if __name__ == "__main__":
    main()