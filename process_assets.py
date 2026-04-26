import os
import fitz  # PyMuPDF
from rembg import remove
from PIL import Image

def extract_pdf_info(pdf_path):
    print(f"--- Extracting info from {pdf_path} ---")
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    print("Text content:")
    print(text)
    
    # Extract images to look at colors/style if needed
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(0.2, 0.2))
        pix.save(f"pdf_preview_page_{i}.png")
    
    print("Saved PDF preview.")

def remove_background(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Skipping {input_path}, not found.")
        return
        
    print(f"Removing background from {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Saved {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    pdf_file = "Invitacion Baby Shower Dubian Andres.pdf"
    if os.path.exists(pdf_file):
        extract_pdf_info(pdf_file)
    else:
        print(f"PDF {pdf_file} not found in current directory.")
        
    assets_dir = "src/assets"
    images_to_process = ["hero.png", "stork.png", "balloons.png", "astrolabe.png"]
    
    for img in images_to_process:
        input_file = os.path.join(assets_dir, img)
        output_file = os.path.join(assets_dir, f"bg_removed_{img}")
        remove_background(input_file, output_file)
