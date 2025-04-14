import kagglehub

# Download latest version
path = kagglehub.dataset_download("yasharjebraeily/drowsy-detection-dataset")

print("Path to dataset files:", path)