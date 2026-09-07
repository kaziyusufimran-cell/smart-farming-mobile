import sys
import json
import os

from ultralytics import YOLO


# =====================================================
# YOLO MODEL
# =====================================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "pest",
    "best.pt"
)
# =====================================================
# LOAD MODEL
# =====================================================

try:
    model = YOLO(MODEL_PATH)

except Exception as error:
    print(
        json.dumps({
            "success": False,
            "error": f"Failed to load YOLO model: {str(error)}"
        })
    )

    sys.exit(1)


# =====================================================
# CHECK IMAGE PATH
# =====================================================

if len(sys.argv) < 2:

    print(
        json.dumps({
            "success": False,
            "error": "Image path not provided"
        })
    )

    sys.exit(1)


image_path = sys.argv[1]


if not os.path.exists(image_path):

    print(
        json.dumps({
            "success": False,
            "error": f"Image not found: {image_path}"
        })
    )

    sys.exit(1)


# =====================================================
# RUN YOLO
# =====================================================

try:

    results = model(
        image_path,
        verbose=False
    )

    result = results[0]

    detections = []


    # =================================================
    # EXTRACT DETECTIONS
    # =================================================

    if result.boxes is not None:

        for box in result.boxes:

            class_id = int(
                box.cls[0]
            )

            confidence = float(
                box.conf[0]
            )

            class_name = model.names[
                class_id
            ]

            detections.append({

                "classId": class_id,

                "className": class_name,

                "confidence": round(
                    confidence * 100,
                    2
                ),

                "x1": float(
                    box.xyxy[0][0]
                ),

                "y1": float(
                    box.xyxy[0][1]
                ),

                "x2": float(
                    box.xyxy[0][2]
                ),

                "y2": float(
                    box.xyxy[0][3]
                )

            })


    # =================================================
    # RESPONSE
    # =================================================

    print(
        json.dumps({

            "success": True,

            "image": image_path,

            "count": len(
                detections
            ),

            "detections": detections

        })
    )


except Exception as error:

    print(
        json.dumps({

            "success": False,

            "error": str(error)

        })
    )

    sys.exit(1)