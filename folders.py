import os
import shutil
import random

def split_dataset(src_folder, dest_folder, train_ratio=0.7, test_ratio=0.2, val_ratio=0.1):
    # Ensure the ratios sum up to 1
    # assert train_ratio + test_ratio + val_ratio == 1, "Ratios must sum to 1."
    
    # Create destination folders for train, test, and validation sets
    train_dir = os.path.join(dest_folder, 'train')
    test_dir = os.path.join(dest_folder, 'test')
    val_dir = os.path.join(dest_folder, 'val')

    for folder in [train_dir, test_dir, val_dir]:
        os.makedirs(folder, exist_ok=True)

    # Process each class folder in the source directory
    class_folders = [f for f in os.listdir(src_folder) if os.path.isdir(os.path.join(src_folder, f))]

    for class_folder in class_folders:
        class_path = os.path.join(src_folder, class_folder)
        
        # List all images in the class folder
        image_files = [f for f in os.listdir(class_path) if os.path.isfile(os.path.join(class_path, f))]

        # Shuffle the image files randomly
        random.shuffle(image_files)

        # Split the images into train, test, and validation
        num_images = len(image_files)
        num_train = int(num_images * train_ratio)
        num_test = int(num_images * test_ratio)
        num_val = num_images - num_train - num_test  # Remaining will go to validation

        train_images = image_files[:num_train]
        test_images = image_files[num_train:num_train + num_test]
        val_images = image_files[num_train + num_test:]

        # Copy images into the corresponding folders
        for image in train_images:
            src_image_path = os.path.join(class_path, image)
            dest_image_path = os.path.join(train_dir, class_folder, image)
            os.makedirs(os.path.dirname(dest_image_path), exist_ok=True)
            shutil.copy(src_image_path, dest_image_path)

        for image in test_images:
            src_image_path = os.path.join(class_path, image)
            dest_image_path = os.path.join(test_dir, class_folder, image)
            os.makedirs(os.path.dirname(dest_image_path), exist_ok=True)
            shutil.copy(src_image_path, dest_image_path)

        for image in val_images:
            src_image_path = os.path.join(class_path, image)
            dest_image_path = os.path.join(val_dir, class_folder, image)
            os.makedirs(os.path.dirname(dest_image_path), exist_ok=True)
            shutil.copy(src_image_path, dest_image_path)

    print("Dataset split complete!")


# Example usage:
src_folder = "/Users/maxonfernandes/Desktop/detection/Data1"  # Path to your original dataset with class folders
dest_folder = "/Users/maxonfernandes/Desktop/detection/Data"  # Path where the train/test/val splits will be saved

split_dataset(src_folder, dest_folder)
