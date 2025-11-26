"""
Given a PCD file containing instance labels,
this script computes the points offsets to the centroid
of their respective objects.
Then, a new PCD file is created, replacing the original
points positions with the offset positions.
"""
import argparse
import numpy as np
import pandas as pd
from pypcd import pypcd

def main():
    parser = argparse.ArgumentParser(description="Separate offsets from point cloud.")
    parser.add_argument("file", type=str, help="Input .pcd file")
    parser.add_argument("--use-mean", type=bool, action='store_true', help="Calculate centroids by points mean")
    args = parser.parse_args()
    calculate_offsets(args.file, args.use_mean)
    

def calculate_offsets(filename, use_mean):
        cloud = pypcd.PointCloud.from_path(filename)
        rgb = pypcd.decode_rgb_from_pcl(cloud.pc_data["rgb"])
        
        output_pcd_dict = {}

        output_pcd_dict["rgb"] = cloud.pc_data["rgb"]
        output_pcd_dict["label"] = cloud.pc_data["label"]
        output_pcd_dict["instance"] = cloud.pc_data["instance"]
        
        if use_mean:
            # Offset calculation based on instance cooridnates means
            aux_dict = {
                "x": cloud.pc_data["x"],
                "y": cloud.pc_data["y"],
                "z": cloud.pc_data["z"],
                "instance": output_pcd_dict["instance"],
            }
            aux_df = pd.DataFrame(aux_dict)
            # coords means by instance
            means = aux_df.groupby("instance")[["x", "y", "z"]].mean().reset_index()
            means.columns = ["instance", "mean_x", "mean_y", "mean_z"]
            aux_df = pd.merge(aux_df, means, on="instance")
            
            # offset calculation
            # Isso aqui ta errado, melhor copiar o que o collate do softgroup faz
            output_pcd_dict['x'] = aux_df['mean_x']
            output_pcd_dict['y'] = aux_df['mean_y']
            output_pcd_dict['z'] = aux_df['mean_z']
        else:
            output_pcd_dict['x'] = aux_df['offset_x']
            output_pcd_dict['y'] = aux_df['offset_y']
            output_pcd_dict['z'] = aux_df['offset_z']
            
        df = pd.DataFrame(output_pcd_dict)
        save_pcd(df)


def save_pcd(df, filename="data/offsets.pcd"):
    pypcd.pandas_to_pypcd(df).save_pcd(filename, compression="ascii") # or binary_compressed
    

if __name__ == "__main__":
    main()