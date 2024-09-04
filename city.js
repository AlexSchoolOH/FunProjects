/*
    CITY;
    A driving game or smth;

    By : ObviousAlexC;
    MIT LISCENSE 2024;
*/
window.TWGL_LOAD = (function () {
    const style = document.createElement("style");
    style.innerHTML = `
    canvas {
        image-rendering: optimizeSpeed;             // Older versions of FF
        image-rendering: -moz-crisp-edges;          // FF 6.0+
        image-rendering: -webkit-optimize-contrast; // Webkit (non standard naming)
        image-rendering: -o-crisp-edges;            // OS X & Windows Opera (12.02+)
        image-rendering: crisp-edges;               // Possible future browsers.
        -ms-interpolation-mode: nearest-neighbor;   // IE (non standard naming)

        width:auto;
        height:100%;

        aspect-ratio: 640/480;

        position:absolute;
        top:50%;
        left:50%;
        transform: translate(-50%,-50%);
    }
    `;

    document.body.appendChild(style);

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    document.body.appendChild(canvas);

    const inputs = {};
    document.addEventListener("keydown", (event) => {
        inputs[event.key.toLowerCase()] = true;
    })
    document.addEventListener("keyup", (event) => {
        inputs[event.key.toLowerCase()] = false;
    })

    const GL = canvas.getContext("webgl2", {antialias: false}) || canvas.getContext("webgl", {antialias: false});

    const shaders = twgl.createProgramInfo(GL,[
        `attribute highp vec3 a_position;
        attribute highp vec4 a_color;
        varying highp vec4 v_color;

        uniform highp vec4 u_camera;
        uniform highp vec3 u_objectOffset;
        uniform highp float u_yaw;

        highp vec3 rotate(highp vec3 position) {
            return vec3(
                position.y * sin(u_yaw) + position.x * cos(u_yaw),
                position.y * cos(u_yaw) - position.x * sin(u_yaw),
                position.z
            );
        }

        void main()
        {
            v_color = a_color;
            highp vec3 offset = (rotate(a_position) - u_camera.xyz) + u_objectOffset.xyz;
            gl_Position = vec4((offset.xyz - vec3(0,0,1)) * vec3(u_camera.w,u_camera.w,1),offset.z * u_camera.w);
            gl_Position.x *= 0.75;
        }`,
        `varying highp vec4 v_color;

        void main()
        {
            gl_FragColor = v_color;
            gl_FragColor.rgb *= gl_FragColor.a;
            if (gl_FragColor.a == 0.0) {
                discard;
            }
        }`
    ]);

    const A = 3.5;
    const B = 3.25;
    const C = 0.0625;
    const D = 1.5;

    const level = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,2,2,2,2,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,2,2,2,2,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,2,2,2,2,C,3,3,3,3,4,4,4,4,3,3,3,3,2,2,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,2,2,2,2,C,3,3,3,3,4,4,4,4,3,3,3,3,2,2,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,2,2,2,2,C,3,3,3,3,4,4,4,4,3,3,3,3,2,2,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,2,2,2,2,C,3,3,3,3,4,4,4,4,3,3,3,3,2,2,C,0,0,0,C,C,C,C,C,C,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,1,1,1,1,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,0,0,0,C,D,D,D,D,D,D,D,D,D,D,D,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,1,1,1,1,C,3,3,3,3,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,1,1,1,1,C,3,3,3,3,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,C,C,C,C,C,C,3,3,3,3,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,C,C,3,3,3,3,C,0,0,0,C,C,C,C,C,C,C,0,0,0,C,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,C,C,3,3,3,3,C,0,0,0,C,3,3,3,3,3,C,0,0,0,C,9,9,9,9,9,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,C,3,3,3,3,C,0,0,0,C,3,B,B,B,3,C,0,0,0,C,9,9,9,9,9,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,C,B,4,4,B,C,0,0,0,C,3,B,A,B,3,C,0,0,0,C,9,9,9,9,9,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,C,A,4,4,A,C,0,0,0,C,3,B,B,B,3,C,0,0,0,C,9,9,9,9,9,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,C,5,5,5,5,C,0,0,0,C,3,A,A,A,3,C,0,0,0,C,9,9,9,9,9,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,C,5,5,5,5,C,0,0,0,C,4,4,4,4,4,C,0,0,0,C,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,5,5,5,5,C,0,0,0,C,4,4,4,4,4,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,5,5,5,5,C,0,0,0,C,4,4,4,4,4,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,A,4,4,A,C,0,0,0,C,4,4,4,4,4,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,B,4,4,B,C,0,0,0,C,4,4,4,4,4,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,3,3,3,3,C,0,0,0,C,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,3,3,3,3,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,3,3,3,3,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,C,0,0,0,C,C,C,C,C,C,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

    const getTileAt =(X,Y) => {
        if (X < 0 || Y < 0) {
            return -1;
        }
        
        if (level[Math.floor(Y)]) {
            if (level[Math.floor(Y)][Math.floor(X)] !== undefined) {
                return level[Math.floor(Y)][Math.floor(X)];
            }
        }

        return -1;
    }

    const LevelToMesh = () => {
        let newMesh = {
            a_position: [],
            a_color: []
        };

        for (let Y = 0; Y < level.length; Y++) {
            const horizontalStrip = level[Y];
            for (let X = 0; X < horizontalStrip.length; X++) {
                const tile = horizontalStrip[X];
                
                const color = [
                    Math.abs(Math.sin(tile * 6)),
                    Math.abs(Math.sin((tile * 2) + (Math.PI / 2))),
                    Math.abs(Math.cos((tile * 4))),
                    1
                ];

                newMesh.a_color.push(...color);
                newMesh.a_color.push(...color);
                newMesh.a_color.push(...color);

                newMesh.a_color.push(...color);
                newMesh.a_color.push(...color);
                newMesh.a_color.push(...color);

                newMesh.a_position.push(
                    X,Y,10-tile,
                    X + 1,Y,10-tile,
                    X,Y + 1,10-tile,

                    X,Y + 1,10-tile,
                    X + 1,Y,10-tile,
                    X + 1,Y + 1,10-tile
                );

                color[0] *= 0.95;
                color[1] *= 0.95;
                color[2] *= 0.95;

                let lower = getTileAt(X,Y - 1);

                if (lower < tile) {
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);

                    newMesh.a_position.push(
                        X,Y,10-tile,
                        X + 1,Y,10-tile,
                        X,Y,10-lower,

                        X,Y,10-lower,
                        X + 1,Y,10-tile,
                        X + 1,Y,10-lower
                    );
                }

                lower = getTileAt(X,Y + 1);

                if (lower < tile) {
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);

                    newMesh.a_position.push(
                        X,Y + 1,10-tile,
                        X + 1,Y + 1,10-tile,
                        X,Y + 1,10-lower,

                        X,Y + 1,10-lower,
                        X + 1,Y + 1,10-tile,
                        X + 1,Y + 1,10-lower
                    );
                }

                color[0] *= 0.95;
                color[1] *= 0.95;
                color[2] *= 0.95;

                lower = getTileAt(X - 1,Y);

                if (lower < tile) {
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);

                    newMesh.a_position.push(
                        X,Y,10-tile,
                        X,Y + 1,10-tile,
                        X,Y,10-lower,

                        X,Y,10-lower,
                        X,Y + 1,10-tile,
                        X,Y + 1,10-lower
                    );
                }

                lower = getTileAt(X + 1,Y);

                if (lower < tile) {
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);
                    newMesh.a_color.push(...color);

                    newMesh.a_position.push(
                        X + 1,Y,10-tile,
                        X + 1,Y + 1,10-tile,
                        X + 1,Y,10-lower,

                        X + 1,Y,10-lower,
                        X + 1,Y + 1,10-tile,
                        X + 1,Y + 1,10-lower
                    );
                }
            }
        }

        newMesh.a_position = {numComponents: 3, data:new Float32Array(newMesh.a_position)};
        newMesh.a_color = {numComponents: 4, data:new Float32Array(newMesh.a_color)};

        return newMesh;
    }

    let levelMesh = LevelToMesh();
    let levelBufferInfo = twgl.createBufferInfoFromArrays(GL, levelMesh);

    GL.viewport(0,0,640,480);
    GL.useProgram(shaders.program);
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    let camera = [0,0,0,100];
    let pedModel = twgl.createBufferInfoFromArrays(GL, {
        a_position: {numComponents: 3, data:new Float32Array([
            -0.2,-0.2,0,
            0.2,-0.2,0,
            -0.2,0.2,0,

            -0.2,0.2,0,
            0.2,-0.2,0,
            0.2,0.2,0,
        ])},
        a_color: {numComponents: 4, data:new Float32Array([
            0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1
        ])},
    })

    let carModel = twgl.createBufferInfoFromArrays(GL, {
        a_position: {numComponents: 3, data:new Float32Array([
            -0.2,-0.4,0,
            0.2,-0.4,0,
            -0.2,0.4,0,

            -0.2,0.4,0,
            0.2,-0.4,0,
            0.2,0.4,0,
        ])},
        a_color: {numComponents: 4, data:new Float32Array([
            1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1
        ])},
    })

    class ped {
        onFoot = true;
        ridingCar = null;
        yaw = 0;
        grounded = 0;

        constructor(X,Y,Z) {
            this.x = X;
            this.y = Y;
            this.z = Z + 0.05;
            
            this.vx = 0;
            this.vy = 0;
            this.vz = 0;
        }

        isColliding(stepUpHeight) {
            stepUpHeight = stepUpHeight || 0;
            return !(getTileAt(this.x,this.y) <= this.z - 0.05 + stepUpHeight   );
        }

        moveAndCollide() {
            this.x += this.vx;
            if (this.isColliding(0.1)) {
                this.x -= this.vx;
                this.vx *= 0.3;
            }
            this.y += this.vy;
            if (this.isColliding(0.1)) {
                this.y -= this.vy;
                this.vy *= 0.3;
            }
            this.z += this.vz;
            if (this.isColliding()) {
                if (this.z - 0.05 < getTileAt(this.x,this.y)) {
                    this.z = getTileAt(this.x,this.y) + 0.05;
                }
                this.z -= this.vz;
                this.vz *= 0.3;
                this.grounded = true;
            }
            else {
                this.vz -= 0.01;
                this.grounded = false;
            }
        }

        _update() {
            this.update();
            this.moveAndCollide();
            this.postMove();
        }

        update() {};

        postMove() {};

        interpRotation(yaw,targetYaw,amount) {
            let difference = Math.abs(targetYaw - yaw);
            if (difference > Math.PI)
            {
                // We need to add on to one of the values.
                if (targetYaw > yaw)
                {
                    // We'll add it on to start...
                    yaw += Math.PI * 2;
                }
                else
                {
                    // Add it on to end.
                    targetYaw += Math.PI * 2;
                }
            }

            // Interpolate it.
            let value = (yaw + ((targetYaw - yaw) * amount));

            // Wrap it..

            if (value >= 0 && value <= Math.PI * 2)
                return value;

            return (value % Math.PI * 2);
        }

        _draw() {
            twgl.setUniforms(shaders,{u_camera:camera, u_objectOffset:[this.x,this.y,10 - this.z],u_yaw:this.yaw});
            this.draw();
        }

        draw() {
            twgl.setBuffersAndAttributes(GL,shaders,pedModel);
            twgl.drawBufferInfo(GL, pedModel);
        }
    }

    class car extends ped {
        isPlayers = false;
        forwardVel = 0;
        yawVelocity = 0;

        setPlayerOwnership(ownership) {
            this.isPlayers = ownership;
        }

        drive() {
            let driving = false;
            if (this.isPlayers) {
                if (inputs.w) {
                    this.forwardVel += 0.025;
                    driving = true;
                }
                else if (inputs.s) {
                    this.forwardVel -= 0.0125;
                    driving = true;
                }

                if (inputs.a) {
                    this.yawVelocity -= 0.0625 * this.forwardVel;
                }
                if (inputs.d) {
                    this.yawVelocity += 0.0625 * this.forwardVel;
                }
            }
                
            this.vx = Math.sin(this.yaw) * this.forwardVel;
            this.vy = Math.cos(this.yaw) * this.forwardVel;

            this.yaw += this.yawVelocity;

            if (driving) {
                this.forwardVel *= 0.9;
                this.yawVelocity *= 0.85;
            }
            else {
                this.forwardVel *= 0.985;
                this.yawVelocity *= 0.9;
            }
        }        

        draw() {
            twgl.setBuffersAndAttributes(GL,shaders,carModel);
            twgl.drawBufferInfo(GL, carModel);
        }
    }

    class player extends ped {
        targetDirection = 0;
        targetLook = [1,0];

        update() {
            if (this.onFoot) {
                this.targetLook = [0,0];

                let moving = false;
                if (inputs.w) {
                    this.targetLook[1] = -1;
                    moving = true;
                }
                if (inputs.s) {
                    this.targetLook[1] = 1;
                    moving = true;
                }
    
                if (inputs.a) {
                    this.targetLook[0] = -1;
                    moving = true;
                }
                if (inputs.d) {
                    this.targetLook[0] = 1;
                    moving = true;
                }

                if (moving) {
                    this.targetDirection = (Math.atan2(this.targetLook[1],this.targetLook[0]) + Math.PI * 0.5);
                    if (this.targetDirection < 0) {
                        this.targetDirection += Math.PI * 2;
                    }

                    this.yaw = this.interpRotation(this.yaw,this.targetDirection,0.125);
                    if (this.grounded) {
                        this.vx += Math.sin(this.yaw) * (inputs.shift ? 0.1 : 0.05);
                        this.vy += Math.cos(this.yaw) * (inputs.shift ? 0.1 : 0.05);
                    }
                }
                
            }
            else if(this.ridingCar) {
                this.ridingCar.drive();
                this.x = this.ridingCar.x;
                this.y = this.ridingCar.y;
                this.z = this.ridingCar.z;
                this.yaw = this.ridingCar.yaw;
            }
        }

        ride(car) {
            this.ridingCar = car;
            this.onFoot = false;
            car.setPlayerOwnership(true);
        }

        postMove() {
            if (this.onFoot) {
                camera[0] = this.x;
                camera[1] = this.y;
                camera[2] += (5 - camera[2]) * 0.0625;
                
                if (this.grounded) {
                    this.vx *= 0.3;
                    this.vy *= 0.3;
                }
            }
            else {
                camera[0] = this.ridingCar.x + this.ridingCar.vx * 4;
                camera[1] = this.ridingCar.y + this.ridingCar.vy * 4;
                camera[2] += ((5 - Math.min(5,Math.pow(Math.abs(this.ridingCar.forwardVel) * 25,1.5))) - camera[2]) * 0.0625;
                console.log(camera[2])
                
                if (this.grounded) {
                    this.vx *= 0.8;
                    this.vy *= 0.8;
                }
            }
        }
    }

    let ents = [];

    ents.push(new player(3,3,2),new car(3,3,2));

    ents[0].ride(ents[1]);

    //I love multi one-liners;
    setInterval(() => {
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        for (let entID = 0; entID < ents.length; entID++) {ents[entID]._update();}

        twgl.setUniforms(shaders,{u_camera:camera, u_objectOffset:[0,0,0],u_yaw:0});
        twgl.setBuffersAndAttributes(GL,shaders,levelBufferInfo);
        twgl.drawBufferInfo(GL, levelBufferInfo);

        for (let entID = 0; entID < ents.length; entID++) {ents[entID]._draw();}
    }, 16);
});