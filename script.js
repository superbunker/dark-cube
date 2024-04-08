let nodeData = {};

async function loadNodeData() {
    try {
        const response = await fetch('data.json');
        nodeData = await response.json();
    } catch (error) {
        console.error('Error loading node data:', error);
    }
}

loadNodeData();

document.addEventListener("DOMContentLoaded", function() {
    const cubeSize = 6;
    const nodeOpacity = 0.7;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const nodes = [];

    // Create nodes for the cube
    for (let x = 0; x < cubeSize; x++) {
        for (let y = 0; y < cubeSize; y++) {
            for (let z = 0; z < cubeSize; z++) {
                const color = new THREE.Color(`rgb(${255 - x * 51}, ${255 - y * 51}, ${255 - z * 51})`);
                const nodeMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: nodeOpacity });
                const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                node.position.set(x - cubeSize / 2, y - cubeSize / 2, z - cubeSize / 2); // Position the node relative to the center of the cube
                cubeGroup.add(node);
                nodes.push(node);
            }
        }
    }

    let selectedNode = nodes[0];
    const selectedNodeMaterial = new THREE.MeshBasicMaterial({ color: selectedNode.material.color, opacity: 1 });
    const selectedNodeGeometry = new THREE.SphereGeometry(0.2, 16, 16); // Larger geometry for the selected node
    const selectedNodeMesh = new THREE.Mesh(selectedNodeGeometry, selectedNodeMaterial);
    selectedNodeMesh.position.copy(selectedNode.position);
    cubeGroup.add(selectedNodeMesh);

    // Create a distinct node for (5, 5, 5)
    const darkStarNode = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16), // Same size as other nodes
        new THREE.MeshBasicMaterial({ color: 0x222222, emissive: 0x333333 })
    );
    darkStarNode.position.set(5 - cubeSize / 2, 5 - cubeSize / 2, 5 - cubeSize / 2);
    cubeGroup.add(darkStarNode);

    let isRotating = true;

    function toggleRotation() {
        isRotating = !isRotating;
    }

    function updateSelectedNode() {
        const x = +document.getElementById('x').value;
        const y = +document.getElementById('y').value;
        const z = +document.getElementById('z').value;

        const selectedNodeIndex = x * cubeSize * cubeSize + y * cubeSize + z;
        selectedNode = nodes[selectedNodeIndex];
        selectedNodeMaterial.color.set(selectedNode.material.color);
        selectedNodeMesh.position.copy(selectedNode.position);

        // Increase the size of the selected node mesh if it's the (5, 5, 5) node
        if (x === 5 && y === 5 && z === 5) {
            selectedNodeMesh.geometry = new THREE.SphereGeometry(0.2, 32, 32);
        } else {
            selectedNodeMesh.geometry = selectedNodeGeometry;
        }

        const nodeNumber = (x * 100) + (y * 10) + z;
        document.getElementById('nodeNumberValue').textContent = nodeNumber.toString().padStart(3, '0');

        // Update text overlay content
        const textOverlay = document.getElementById('text-overlay');
        const nodeKey = `${x}${y}${z}`;
        const nodeInfo = nodeData[nodeKey] || {
            title: `Node (${x}, ${y}, ${z})`,
            shortDescription: 'This node has no additional information.',
            longDescription: 'This node has no additional information.'
        };

        textOverlay.innerHTML = `
            <h2>${nodeInfo.title}</h2>
            <p>${nodeInfo.shortDescription}</p>
            <p>${nodeInfo.longDescription}</p>
        `;
        textOverlay.style.display = 'block'; // Show text overlay
    }

    ['x', 'y', 'z'].forEach(axis => {
        document.getElementById(axis).addEventListener('input', updateSelectedNode);
    });

    function animate() {
        requestAnimationFrame(animate);
        if (isRotating) {
            cubeGroup.rotation.y += 0.002; // Adjust the rotation speed
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pause rotation when the page is hidden
    document.addEventListener('visibilitychange', toggleRotation);
});
