"""
Given a PCD file containing information about centroids, 
this script separates the centroid coordinates from the 
original points, saving only the centroid coordinates in 
a new PCD file as the new XYZ coordinates.
"""
import argparse
import numpy as np
import pandas as pd
from pypcd import pypcd

def main():
    parser = argparse.ArgumentParser(description="Separate offsets from point cloud.")
    parser.add_argument("file", type=str, help="Input .pcd file")
    args = parser.parse_args()

    cloud = pypcd.PointCloud.from_path(args.file)
        
    cloud.pc_data['x'] = cloud.pc_data['x'] + cloud.pc_data['offs_pred_x']
    cloud.pc_data['y'] = cloud.pc_data['y'] + cloud.pc_data['offs_pred_y']
    cloud.pc_data['z'] = cloud.pc_data['z'] + cloud.pc_data['offs_pred_z']
    cloud.save_pcd(args.file.replace(".pcd", "_centroids_pred.pcd"), compression="ascii")
    
if __name__ == "__main__":
    main()