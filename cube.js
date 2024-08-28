(function() {
    const renderer = document.createElement("canvas");
    renderer.width = window.innerWidth;
    renderer.height = window.innerHeight;
    renderer.style.margin = "0px";
    renderer.style.padding = "0px";
    let halfSize = [renderer.width / 2, renderer.height / 2];

    const gl = renderer.getContext("2d");

    document.body.appendChild(renderer);

    const camera = {
        x:0,
        y:0,
        z:-100,

        targetX:0,
        targetY:0,

        turnTableYaw:0,
        turnTableTargetYaw:0,

        FOV:halfSize[1],
    };

    let cubePosition = [0,0,0];
    let clicked = false;

    document.onmousemove = (event) => {
        camera.targetX = ((event.clientX - halfSize[0]) / renderer.width) * 100;
        camera.targetY = ((event.clientY - halfSize[1]) / renderer.height) * 100;
        if (clicked) {
            camera.turnTableTargetYaw += event.movementX / 100;
        }
    }

    document.onmousedown = () => {
        clicked = true;
    }

    document.onmouseup = () => {
        clicked = false;
    }

    
    window.onresize = () => {
        renderer.width = window.innerWidth;
        renderer.height = window.innerHeight;
        halfSize = [renderer.width / 2, renderer.height / 2];

        camera.FOV = halfSize[1];
    }


    const pointToScreen = (x,y,z) => {
        const projection = camera.FOV / z;

        return [
            x * projection,
            y * projection
        ];
    }

    const drawTri = ([x1,y1,z1],[x2,y2,z2],[x3,y3,z3]) => {
        const [sx1, sy1] = pointToScreen(x1,y1,z1);
        const [sx2, sy2] = pointToScreen(x2,y2,z2);
        const [sx3, sy3] = pointToScreen(x3,y3,z3);

        gl.moveTo(sx1 + halfSize[0],sy1 + halfSize[1]);
        gl.beginPath()
        gl.lineTo(sx2 + halfSize[0],sy2 + halfSize[1]);
        gl.lineTo(sx3 + halfSize[0],sy3 + halfSize[1]);
        gl.lineTo(sx1 + halfSize[0],sy1 + halfSize[1]);
        gl.closePath();
        gl.fill("evenodd");
        gl.stroke();
    }

    let frame = 0;

    let modelPoints = [
        [-10,-10,-10],
        [10,-10,-10],
        [-10,10,-10],
        [-10,-10,10],

        [-10,10,10],
        [10,-10,10],
        [10,10,-10],
        [10,10,10],

        
        [0,0,-15],
        [0,-15,0],
        [-15,0,0],
        [0,0,15],
        [0,15,0],
        [15,0,0],
    ]

    let drawOrder = [];

    let modelIndices = [
        [0,1,8,"#ff0000"],
        [0,2,8,"#ff0000"],
        [2,8,6,"#ff0000"],
        [1,8,6,"#ff0000"],
        
        [3,4,11,"#00ffff"],
        [4,11,7,"#00ffff"],
        [11,3,5,"#00ffff"],
        [11,5,7,"#00ffff"],
        
        [9,0,3,"#00ff00"],
        [5,3,9,"#00ff00"],
        [0,1,9,"#00ff00"],
        [1,9,5,"#00ff00"],

        [2,4,12,"#ff00ff"],
        [6,12,7,"#ff00ff"],
        [2,6,12,"#ff00ff"],
        [12,4,7,"#ff00ff"],

        [10,0,3,"#0000ff"],
        [10,4,3,"#0000ff"],
        [10,2,0,"#0000ff"],
        [2,4,10,"#0000ff"],

        [1,13,6,"#ffff00"],
        [5,13,7,"#ffff00"],
        [1,5,13,"#ffff00"],
        [13,6,7,"#ffff00"],
    ]

    const loadModel = (scaleMul) => {
        scaleMul = scaleMul || 1;
        if (window.model) {
            modelPoints = [];
            modelIndices = [];

            let parsing = window.model.split("\n");
            let material = "";

            parsing.forEach(line => {
                if (line.includes("usemtl ")) {
                    material = line.split(" ")[1];
                    console.log(material);
                    return;
                }

                switch (line.charAt(0)) {
                    case "v":{
                        //Parse vertices
                        if (line.charAt(1) == " ") {
                            const positions = line.replace("  "," ").split(" ");

                            //Cast these to numbers
                            modelPoints.push([Number(positions[1]) * scaleMul, Number(positions[2]) * scaleMul, Number(positions[3]) * scaleMul]);
                        }
                        break;
                    }

                    case "f":{
                        const facePoints = line.split(" ");
                        modelIndices.push([Number(facePoints[1].split("/")[0]) - 1,Number(facePoints[2].split("/")[0]) - 1,Number(facePoints[3].split("/")[0]) - 1,window.matToColor(material)]);
                        break;
                    }
                
                    default:
                        break;
                }
            });
        }
    }

    loadModel(10);

    console.log(modelPoints);
    console.log(modelIndices);

    const rotatePoint = ([x,y,z], yaw, pitch) => {
        let old = [x,y,z];
        x = old[2] * Math.sin(yaw) + old[0] * Math.cos(yaw);
        z = old[2] * Math.cos(yaw) - old[0] * Math.sin(yaw);

        old = [x,y,z];
        y = old[2] * Math.sin(pitch) + old[1] * Math.cos(pitch);
        z = old[2] * Math.cos(pitch) - old[1] * Math.sin(pitch);
        return [x,y,z];
    }

    const movePoint = ([x,y,z],[dx,dy,dz]) => {
        return [x + dx, y + dy, z + dz];
    }

    const vecLength = ([x,y,z]) => {
        return Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2));
    }

    setInterval(() => {
        camera.x += (camera.targetX - camera.x) * 0.0625;
        camera.y += (camera.targetY - camera.y) * 0.0625;
        camera.turnTableYaw += (camera.turnTableTargetYaw - camera.turnTableYaw) * 0.0625;

        const cubeYaw = Math.sin(frame / 5) * 0.25;
        const cubePitch = Math.sin(frame / 2.5) * 0.125 + 3.1415962;

        gl.fillStyle = "#ffffff";
        gl.fillRect(0,0,renderer.width,renderer.height);

        gl.fillStyle = "#000000";

        gl.strokeStyle = "#000000";

        drawOrder = [];

        for (let cube = 0; cube < 1; cube++) {
            cubePosition[0] = Math.sin(frame / 5) * 1;
            cubePosition[1] = Math.sin(frame / 2.5) * 0.5;
            //cubePosition[2] = Math.sin((frame + (cube)) / 1.25) * 50;
            for (let indice = 0; indice < modelIndices.length; indice++) {
                const indices = modelIndices[indice];
    
                const point1 = rotatePoint(movePoint(rotatePoint(modelPoints[indices[0]],cubeYaw + cube,cubePitch + (cube * 0.25)),cubePosition),camera.turnTableYaw,0.0);
                const point2 = rotatePoint(movePoint(rotatePoint(modelPoints[indices[1]],cubeYaw + cube,cubePitch + (cube * 0.25)),cubePosition),camera.turnTableYaw,0.0);
                const point3 = rotatePoint(movePoint(rotatePoint(modelPoints[indices[2]],cubeYaw + cube,cubePitch + (cube * 0.25)),cubePosition),camera.turnTableYaw,0.0);

                point1[0] -= camera.x;
                point1[1] -= camera.y;
                point1[2] -= camera.z;
                
                point2[0] -= camera.x;
                point2[1] -= camera.y;
                point2[2] -= camera.z;
    
                point3[0] -= camera.x;
                point3[1] -= camera.y;
                point3[2] -= camera.z;
    
                let length = vecLength(point1);
    
                if (vecLength(point2) < length) {
                    length = vecLength(point2)
                }
                if (vecLength(point3) < length) {
                    length = vecLength(point3)
                }
    
                drawOrder.push([length,indice,point1,point2,point3])
            }
        }

        drawOrder.sort((a,b) => {
            if (a[0] > b[0]) {
                return 1;
            }
            else if (a[0] < b[0]) {
                return -1;
            }

            return 0;
        });

        for (let indice = 0; indice < drawOrder.length; indice++) {
            const curIndice = (drawOrder.length - 1) - indice;
            const indices = modelIndices[drawOrder[curIndice][1]];
            gl.fillStyle = indices[3] + "";
            gl.strokeStyle = indices[3];

            drawTri(
                drawOrder[curIndice][2],
                drawOrder[curIndice][3],
                drawOrder[curIndice][4]
            );
        }

        frame = Date.now() / 500;
    },8);
})()