// Configuración de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Cargador de GLTF
const loader = new THREE.GLTFLoader();

// Cargar personaje
let personaje;
loader.load('assets/personaje.gltf', function (gltf) {
    personaje = gltf.scene;
    scene.add(personaje);
    personaje.scale.set(0.5, 0.5, 0.5);
    personaje.position.set(0, 0, 0); // Posición inicial
}, undefined, function (error) {
    console.error(error);
});

// Cubo (objetivo)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0, -5);

// Posición de la cámara (tercera persona)
camera.position.set(0, 3, 7);
camera.lookAt(0, 0, 0);

// Joystick para móviles
const joystick = nipplejs.create({ zone: document.getElementById('joystick') });
let joystickDirection = { x: 0, y: 0 };

joystick.on('move', function (evt, data) {
    joystickDirection.x = data.vector.x;
    joystickDirection.y = data.vector.y;
});

joystick.on('end', function () {
    joystickDirection = { x: 0, y: 0 };
});

// Evento de clic para disparar
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    if (personaje) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([cube]);
        if (intersects.length > 0) {
            console.log('¡Impacto!');
        }
    }
}

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);

    if (personaje) {
        personaje.rotation.y += joystickDirection.x * 0.05;
        personaje.position.x += joystickDirection.x * 0.05;
        personaje.position.z += -joystickDirection.y * 0.05;

        // Mantener la cámara detrás del personaje
        const offset = new THREE.Vector3(0, 3, 7);
        offset.applyQuaternion(personaje.quaternion);
        camera.position.copy(personaje.position).add(offset);
        camera.lookAt(personaje.position);
    }
    renderer.render(scene, camera);
}

animate();