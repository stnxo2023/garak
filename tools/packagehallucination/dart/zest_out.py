from datasets import load_dataset

ds = load_dataset("dchitimalla1/perl-20250529", split="train")
print(ds.column_names)        # ['name']
print(ds[:1000])                 # Preview top 5
print("http" in ds["name"])   # True if present
