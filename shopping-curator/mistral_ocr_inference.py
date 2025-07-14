import base64
from mistralai import Mistral


def encode_image_to_base64(image_path):
    """
    Encode a local image file to base64.
    """
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    except FileNotFoundError:
        print(f"Error: File not found - {image_path}")
        return None
    except Exception as e:
        print(f"Unexpected error while encoding image: {e}")
        return None


def run_mistral_ocr(file_obj, api_key):
    """
    Accepts a Django InMemoryUploadedFile or file-like object,
    encodes it and sends it to Mistral OCR API.
    Returns the extracted text (as markdown).
    """
    try:
        base64_image = base64.b64encode(file_obj.read()).decode("utf-8")

        client = Mistral(api_key=api_key)
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{base64_image}"
            },
            include_image_base64=False
        )

        return "\n".join([page.markdown.strip() for page in ocr_response.pages])

    except Exception as e:
        raise RuntimeError(f"Mistral OCR failed: {e}")


# === Standalone test section ===
if __name__ == "__main__":
    # Local image testing
    image_path = "./grocery_sample00.png"
    api_key = "JpnYtAsqsdFzqUc16c5CSByhch2rW7yQ"  # Ideally use os.getenv("MISTRAL_API_KEY")

    base64_image = encode_image_to_base64(image_path)

    if base64_image:
        client = Mistral(api_key=api_key)
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{base64_image}"
            },
            include_image_base64=False
        )

        print("=== OCR Result ===\n")
        for page in ocr_response.pages:
            print(page.markdown.strip())
            print("=" * 80)
