import os
import json
import zipfile
import struct
import math
import hashlib

def create_minimal_glb(output_path):
    """
    Genera un archivo GLB 2.0 binario válido con 5 mallas anatómicas con nombre:
    maxilla, os_sphenoidale, os_palatinum, arteria_maxillaris, nervus_maxillaris
    """
    structures = [
        ("maxilla", [0.0, 0.0, 0.0], [0.8, 0.75, 0.7]),
        ("os_sphenoidale", [0.0, 0.5, -0.5], [0.85, 0.8, 0.65]),
        ("os_palatinum", [0.0, -0.3, -0.2], [0.75, 0.7, 0.6]),
        ("arteria_maxillaris", [0.2, 0.1, 0.1], [0.9, 0.1, 0.15]),
        ("nervus_maxillaris", [-0.2, 0.2, -0.1], [0.95, 0.85, 0.1])
    ]

    # Geometría básica de un cubo (8 vértices, 36 índices)
    unit_vertices = [
        -0.2, -0.2,  0.2,   0.2, -0.2,  0.2,   0.2,  0.2,  0.2,  -0.2,  0.2,  0.2,
        -0.2, -0.2, -0.2,   0.2, -0.2, -0.2,   0.2,  0.2, -0.2,  -0.2,  0.2, -0.2
    ]
    indices = [
        0, 1, 2,  2, 3, 0,  # Front
        1, 5, 6,  6, 2, 1,  # Right
        5, 4, 7,  7, 6, 5,  # Back
        4, 0, 3,  3, 7, 4,  # Left
        3, 2, 6,  6, 7, 3,  # Top
        4, 5, 1,  1, 0, 4   # Bottom
    ]

    bin_data = bytearray()
    nodes = []
    meshes = []
    accessors = []
    buffer_views = []
    materials = []

    for idx, (name, pos, color) in enumerate(structures):
        # Material
        materials.append({
            "name": f"mat_{name}",
            "pbrMetallicRoughness": {
                "baseColorFactor": [color[0], color[1], color[2], 1.0],
                "metallicFactor": 0.1,
                "roughnessFactor": 0.6
            }
        })

        # Vértices con offset de posición
        vert_bytes = bytearray()
        for i in range(0, len(unit_vertices), 3):
            vx = unit_vertices[i] + pos[0]
            vy = unit_vertices[i+1] + pos[1]
            vz = unit_vertices[i+2] + pos[2]
            vert_bytes.extend(struct.pack("<fff", vx, vy, vz))

        # Índices
        idx_bytes = bytearray()
        for ind in indices:
            idx_bytes.extend(struct.pack("<H", ind))

        # Padding a 4 bytes
        while len(vert_bytes) % 4 != 0:
            vert_bytes.append(0)
        while len(idx_bytes) % 4 != 0:
            idx_bytes.append(0)

        # BufferView para vértices
        bv_vert_offset = len(bin_data)
        bin_data.extend(vert_bytes)
        bv_vert_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": bv_vert_offset,
            "byteLength": len(vert_bytes),
            "target": 34962 # ARRAY_BUFFER
        })

        # Accessor para vértices
        acc_vert_idx = len(accessors)
        accessors.append({
            "bufferView": bv_vert_idx,
            "byteOffset": 0,
            "componentType": 5126, # FLOAT
            "count": 8,
            "type": "VEC3",
            "max": [pos[0] + 0.2, pos[1] + 0.2, pos[2] + 0.2],
            "min": [pos[0] - 0.2, pos[1] - 0.2, pos[2] - 0.2]
        })

        # BufferView para índices
        bv_idx_offset = len(bin_data)
        bin_data.extend(idx_bytes)
        bv_idx_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": bv_idx_offset,
            "byteLength": len(idx_bytes),
            "target": 34963 # ELEMENT_ARRAY_BUFFER
        })

        # Accessor para índices
        acc_idx_idx = len(accessors)
        accessors.append({
            "bufferView": bv_idx_idx,
            "byteOffset": 0,
            "componentType": 5123, # UNSIGNED_SHORT
            "count": len(indices),
            "type": "SCALAR"
        })

        # Malla
        mesh_idx = len(meshes)
        meshes.append({
            "name": name,
            "primitives": [{
                "attributes": { "POSITION": acc_vert_idx },
                "indices": acc_idx_idx,
                "material": idx
            }]
        })

        # Nodo
        nodes.append({
            "name": name,
            "mesh": mesh_idx
        })

    gltf_dict = {
        "asset": { "version": "2.0", "generator": "ILPKG-Studio-Synthetic-Builder" },
        "scene": 0,
        "scenes": [{ "nodes": list(range(len(nodes))) }],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{ "byteLength": len(bin_data) }]
    }

    json_bytes = json.dumps(gltf_dict).encode("utf-8")
    while len(json_bytes) % 4 != 0:
        json_bytes += b" "

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    with open(output_path, "wb") as f:
        # GLB Header
        f.write(struct.pack("<4sII", b"glTF", 2, total_len))
        # Chunk 0: JSON
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        # Chunk 1: BIN
        f.write(struct.pack("<II", len(bin_data), 0x004E4942))
        f.write(bin_data)

def create_synthetic_wav(output_path, duration_seconds=120):
    """
    Genera un archivo WAV válido de 120 segundos con una modulación suave
    para que Wavesurfer dibuje una forma de onda visible y atractiva.
    """
    sample_rate = 22050
    num_samples = int(duration_seconds * sample_rate)
    
    with open(output_path, "wb") as f:
        # RIFF Header
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + num_samples * 2))
        f.write(b"WAVE")
        # fmt chunk
        f.write(b"fmt ")
        f.write(struct.pack("<IHHIIHH", 16, 1, 1, sample_rate, sample_rate * 2, 2, 16))
        # data chunk
        f.write(b"data")
        f.write(struct.pack("<I", num_samples * 2))
        
        # Audio sintetizado con pausas y modulaciones de voz simulada
        chunk_size = 4096
        for start in range(0, num_samples, chunk_size):
            end = min(start + chunk_size, num_samples)
            buf = bytearray()
            for i in range(start, end):
                t = i / sample_rate
                # Simular pausas pedagógicas cada 15 segundos
                active = 0.0 if (int(t) % 15 in [12, 13, 14]) else 1.0
                envelope = 0.5 + 0.5 * math.sin(2 * math.pi * 0.25 * t)
                val = active * envelope * (
                    0.6 * math.sin(2 * math.pi * 220 * t) +
                    0.3 * math.sin(2 * math.pi * 440 * t) +
                    0.1 * math.sin(2 * math.pi * 880 * t)
                )
                sample = int(max(-1.0, min(1.0, val)) * 32767)
                buf.extend(struct.pack("<h", sample))
            f.write(buf)

def create_synthetic_svg(output_path):
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#0f172a"/>
  <circle cx="400" cy="300" r="180" fill="none" stroke="#0288d1" stroke-width="4"/>
  <path d="M 300 200 Q 400 350 500 200 T 550 400" fill="none" stroke="#ff1744" stroke-width="6"/>
  <text x="400" y="80" font-family="sans-serif" font-size="24" fill="#ffffff" text-anchor="middle" font-weight="bold">
    Fosa Pterigopalatina: Esquema Neurovascular
  </text>
  <text x="400" y="320" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">
    Nervio Maxilar (V2) &amp; Arteria Esfenopalatina
  </text>
</svg>'''
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg)

def build_demo_package(dest_ilpkg_path):
    temp_dir = "/tmp/ilpkg_builder_scratch"
    os.makedirs(os.path.join(temp_dir, "models"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "audio"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "slides"), exist_ok=True)

    # 1. Modelo GLB
    glb_path = os.path.join(temp_dir, "models", "anatomy.glb")
    create_minimal_glb(glb_path)

    # 2. Audio WAV/WebM
    audio_path = os.path.join(temp_dir, "audio", "narration.wav")
    create_synthetic_wav(audio_path, duration_seconds=120)

    # 3. Diapositiva SVG
    svg_path = os.path.join(temp_dir, "slides", "diagrama_ramas_v2.svg")
    create_synthetic_svg(svg_path)

    # 4. Thumbnail SVG y WebP placeholder
    thumb_path = os.path.join(temp_dir, "thumb.webp")
    # Imagen dummy binaria
    with open(thumb_path, "wb") as f:
        f.write(b"RIFF\x24\x00\x00\x00WEBPVP8 \x18\x00\x00\x00\x30\x01\x00\x9d\x01\x2a\x10\x00\x10\x00\x00\x00")

    slide_img_path = os.path.join(temp_dir, "slides", "corte_coronal_rmn.webp")
    with open(slide_img_path, "wb") as f:
        f.write(b"RIFF\x24\x00\x00\x00WEBPVP8 \x18\x00\x00\x00\x30\x01\x00\x9d\x01\x2a\x10\x00\x10\x00\x00\x00")

    # 5. Manifest.json
    manifest = {
        "$schema": "https://laab.app/schemas/v1/ilpkg-manifest.json",
        "formatVersion": "1.0.0",
        "packageId": "laab-anat-neuro-042",
        "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "metadata": {
            "title": "Fosa Pterigopalatina: Relaciones y Abordajes",
            "slug": "fosa-pterigopalatina-relaciones-abordajes",
            "description": "Estudio anatómico tridimensional de los límites, forámenes y contenido neurovascular de la fosa pterigopalatina.",
            "authors": [
                {
                    "name": "Dr. Antonio Sánchez Uresti",
                    "role": "Autor de Contenido / Anatomista",
                    "institution": "UANL"
                }
            ],
            "discipline": "Anatomía Humana",
            "subdiscipline": "Neuroanatomía / Cabeza y Cuello",
            "targetAudience": "Pregrado Medicina / Ingeniería Biomédica",
            "language": "es-MX",
            "license": "CC-BY-NC-SA-4.0",
            "createdAt": "2026-10-04T00:00:00Z",
            "updatedAt": "2026-10-04T00:00:00Z"
        },
        "pedagogy": {
            "estimatedDurationSeconds": 120.0,
            "passingScore": 80,
            "totalCheckpoints": 2,
            "maxAttemptsAllowed": 0,
            "allowScrubbingAfterPass": True,
            "learningObjectives": [
                "Identificar los límites óseos de la fosa pterigopalatina.",
                "Reconocer las ramas terminales del nervio maxilar (V2)."
            ]
        },
        "runtimeRequirements": {
            "engineVersion": ">=1.0.0",
            "webglVersion": 2,
            "audioContext": True,
            "requiredExtensions": [],
            "targetHardwareClass": "medium"
        },
        "assets": {
            "entrypoint": "lesson.json",
            "thumbnail": "thumb.webp",
            "masterAudio": {
                "path": "audio/narration.wav",
                "mimeType": "audio/wav",
                "duration": 120.0,
                "sampleRate": 22050
            },
            "models3D": [
                {
                    "id": "pterygoid_fossa_main",
                    "path": "models/anatomy.glb",
                    "format": "gltf-binary",
                    "dracoCompressed": False,
                    "polyCount": 40,
                    "structures": [
                        "maxilla",
                        "os_sphenoidale",
                        "os_palatinum",
                        "arteria_maxillaris",
                        "nervus_maxillaris"
                    ]
                }
            ],
            "staticSlides": [
                {
                    "id": "slide_corte_coronal_rmn",
                    "path": "slides/corte_coronal_rmn.webp",
                    "mimeType": "image/webp",
                    "dimensions": { "width": 800, "height": 600 }
                },
                {
                    "id": "diagrama_ramas_v2",
                    "path": "slides/diagrama_ramas_v2.svg",
                    "mimeType": "image/svg+xml"
                }
            ]
        }
    }

    # 6. Lesson.json
    lesson = {
        "$schema": "https://laab.app/schemas/v1/ilpkg-lesson.json",
        "version": "1.0.0",
        "timeline": {
            "duration": 120.0,
            "events": [
                {
                    "id": "evt_001",
                    "timestamp": 0.0,
                    "type": "camera_transform",
                    "payload": {
                        "position": [0.0, 1.2, 4.5],
                        "target": [0.0, 0.0, 0.0],
                        "duration": 0.0
                    }
                },
                {
                    "id": "evt_002",
                    "timestamp": 14.25,
                    "type": "camera_transform",
                    "payload": {
                        "position": [1.45, 0.82, -2.1],
                        "target": [0.05, 0.12, 0.0],
                        "duration": 2.5,
                        "easing": "power2.inOut"
                    }
                },
                {
                    "id": "evt_003",
                    "timestamp": 22.0,
                    "type": "mesh_opacity",
                    "payload": {
                        "modelId": "pterygoid_fossa_main",
                        "structures": [
                            { "name": "maxilla", "opacity": 0.25 }
                        ],
                        "duration": 1.2
                    }
                },
                {
                    "id": "evt_004",
                    "timestamp": 35.8,
                    "type": "mesh_highlight",
                    "payload": {
                        "modelId": "pterygoid_fossa_main",
                        "structures": ["arteria_maxillaris"],
                        "emissiveColor": "#ff1744",
                        "intensity": 0.8,
                        "duration": 0.8
                    }
                }
            ],
            "checkpoints": [
                {
                    "id": "chk_001",
                    "timestamp": 62.0,
                    "title": "Control Clínico: Irrigación Pterigomaxilar",
                    "prompt": "¿Cuál es la rama terminal de la arteria maxilar que ingresa a la fosa nasal?",
                    "questionType": "single_choice",
                    "points": 10,
                    "rewindTimestamp": 34.0,
                    "allowFreeExploration": True,
                    "options": [
                        {
                            "id": "opt_01",
                            "text": "Arteria esfenopalatina",
                            "isCorrect": True,
                            "feedback": "Correcto. Atraviesa el foramen esfenopalatino hacia las cavidades nasales."
                        },
                        {
                            "id": "opt_02",
                            "text": "Arteria infraorbitaria",
                            "isCorrect": False,
                            "feedback": "Incorrecto. Se dirige hacia anterior por el conducto infraorbitario."
                        }
                    ]
                },
                {
                    "id": "chk_002",
                    "timestamp": 95.0,
                    "title": "Identificación Anatómica Tridimensional",
                    "prompt": "Haga clic sobre el nervio maxilar (V2) antes de su división terminal.",
                    "questionType": "mesh_click",
                    "points": 15,
                    "rewindTimestamp": 75.0,
                    "allowFreeExploration": True,
                    "targetMesh": {
                        "modelId": "pterygoid_fossa_main",
                        "structureName": "nervus_maxillaris"
                    },
                    "feedback": {
                        "success": "Excelente localización del trayecto del nervio maxilar.",
                        "failure": "Estructura incorrecta. Revise el foramen redondo en el fondo de la fosa."
                    }
                }
            ]
        }
    }

    with open(os.path.join(temp_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    with open(os.path.join(temp_dir, "lesson.json"), "w", encoding="utf-8") as f:
        json.dump(lesson, f, indent=2, ensure_ascii=False)

    # Empaquetar como ZIP .ilpkg
    os.makedirs(os.path.dirname(dest_ilpkg_path), exist_ok=True)
    with zipfile.ZipFile(dest_ilpkg_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, temp_dir)
                z.write(full_path, rel_path)

    print(f"Paquete .ilpkg compilado con éxito en: {dest_ilpkg_path}")

if __name__ == "__main__":
    dest = "/home/antsanch/webapps/ILPKG-Studio/public/demo.ilpkg"
    build_demo_package(dest)
