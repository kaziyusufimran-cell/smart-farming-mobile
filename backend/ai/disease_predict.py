import sys
import json
import os
import torch
import torch.nn as nn
from torchvision.models import mobilenet_v2
from PIL import Image
from torchvision import transforms


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "disease",
    "disease_mobilenetv2_a5_plantdoc_best.pt"
)
LABELS_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "disease",
    "class_names_38.json"
)


# ---------------------------------------------------------
# Build MobileNetV2 architecture matching the checkpoint
# ---------------------------------------------------------

def build_model(num_classes=38):

    model = mobilenet_v2(
        weights=None,
        width_mult=1.0
    )

    model.classifier[1] = nn.Linear(
        1280,
        num_classes
    )

    return model


# ---------------------------------------------------------
# Load checkpoint
# ---------------------------------------------------------

def load_model():

    checkpoint = torch.load(
        MODEL_PATH,
        map_location="cpu",
        weights_only=False
    )

    model = build_model(
        checkpoint["num_classes"]
    )

    state_dict = checkpoint["model_state_dict"]

    cleaned_state_dict = {}

    for key, value in state_dict.items():

        if key.startswith("backbone."):

            key = key[len("backbone."):]

        cleaned_state_dict[key] = value

    model.load_state_dict(
        cleaned_state_dict,
        strict=True
    )

    model.eval()

    return model, checkpoint


# ---------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------

transform = transforms.Compose([

    transforms.Resize((600, 600)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )

])


# ---------------------------------------------------------
# Prediction
# ---------------------------------------------------------

def predict(image_path):

    model, checkpoint = load_model()

    image = Image.open(
        image_path
    ).convert("RGB")

    image_tensor = transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    with torch.no_grad():

        output = model(image_tensor)

        probabilities = torch.softmax(
            output,
            dim=1
        )

        confidence, class_index = torch.max(
            probabilities,
            dim=1
        )

    # -----------------------------------------------------
    # Load class names
    # -----------------------------------------------------

    with open(
        LABELS_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        class_names = json.load(f)

    index = int(
        class_index.item()
    )

    # -----------------------------------------------------
    # Get disease name
    # -----------------------------------------------------

    if 0 <= index < len(class_names):

        class_label = class_names[index]

    else:

        class_label = "Unknown"


    # -----------------------------------------------------
    # Result
    # -----------------------------------------------------

    result = {

        "success": True,

        "classIndex": index,

        "classLabel": class_label,

        "confidence": round(
            float(confidence.item()) * 100,
            2
        ),

        "numClasses": checkpoint["num_classes"],

        "inputSize": checkpoint["input_size"],

        "experiment": checkpoint["experiment"]

    }

    return result


# ---------------------------------------------------------
# Main
# ---------------------------------------------------------

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(json.dumps({

            "success": False,

            "error": "Image path is required"

        }))

        sys.exit(1)


    image_path = sys.argv[1]


    try:

        result = predict(
            image_path
        )

        print(
            json.dumps(result)
        )


    except Exception as e:

        print(json.dumps({

            "success": False,

            "error": str(e)

        }))

        sys.exit(1)