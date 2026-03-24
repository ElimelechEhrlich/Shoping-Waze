from openai import OpenAI

client = OpenAI()

def parse_receipt(image_bytes: bytes):

    response = client.responses.create(
        model="gpt-4o-mini",
        input=[{
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Extract receipt items and prices as JSON"},
                {"type": "input_image", "image": image_bytes}
            ]
        }]
    )

    return response.output_parsed