return class MyEffect {
    constructor(display) {
        this.display = display;

        //initialise random shapes
        this.randomShapes = Array.from({ length: 10 }, () =>
            this.#generateRandomCentre()
        );
    }

    #generateRandomCentre() {
        const shapes = ["triangle", "ellipse", "pointed"]; //available shapes
        return {
            x: Math.random() * this.display.width, //random x-coordinate
            y: Math.random() * (this.display.height * 0.9), //random y-coordinate within the upper 90% of the screen
            vx: Math.random() * 2 - 1, //random horizontal velocity
            shapeRadius: Math.floor(Math.random() * 6) + 8, //random radius for the shapes
            shapeLength: Math.floor(Math.random() * 8) + 10, //random length for each shape
            rotation: Math.random() * 360, //random starting rotation angle
            rotationSpeed: Math.random() * 5 + 2, //random rotational speed (2-7 degrees per frame)
            color: [
                Math.floor(Math.random() * 256), //random red component
                Math.floor(Math.random() * 256), //random green component
                Math.floor(Math.random() * 256), //random blue component
            ],
            shape: shapes[Math.floor(Math.random() * shapes.length)], //randomly select a shape
        };
    }

    #clearDisplay() {
        for (let x = 0; x < this.display.width; x++) {
            for (let y = 0; y < this.display.height; y++) {
                this.display.setPixel(x, y, [0, 0, 0]); //set all pixels to black
            }
        }
    }

    #drawRandomShape() {
        for (const shape of this.randomShapes) {
            if (
                shape.x >= 0 && //check if the shape is within the display bounds
                shape.x < this.display.width &&
                shape.y >= 0 &&
                shape.y < this.display.height
            ) {
                this.#drawShape(shape); //draw the shape if it is on-screen
            }
        }
    }

    #drawShape(object) {
        const cx = Math.floor(object.x); //centre x-coordinate
        const cy = Math.floor(object.y); //centre y-coordinate

        //draw the shapes
        const shapeCount = 6; //number of shapes
        const angleStep = 360 / shapeCount; //angle between each shape
        for (let i = 0; i < shapeCount; i++) {
            const angle = ((i * angleStep) + object.rotation) % 360; //calculate the rotated angle
            const rad = (angle * Math.PI) / 180; //convert to radians

            //choose the shape of the shape
            switch (object.shape) {
                case "triangle":
                    this.#drawTriangleShape(cx, cy, rad, object, 3); //draw a triangular shape with thickness 3
                    break;
                case "ellipse":
                    this.#drawFunkyShape(cx, cy, rad, object, 3); //draw an elliptical shape with thickness 3
                    break;
                case "pointed":
                    this.#drawPointedShape(cx, cy, rad, object, 3); //draw a pointed shape with thickness 3
                    break;
            }
        }

        //draw the object's centre
        this.#drawFilledCircle(cx, cy, Math.floor(object.shapeRadius / 4), [255, 255, 0], 3); //yellow centre with thickness 3
    }

    #drawTriangleShape(cx, cy, rad, object, thickness) {
        const gradientSteps = 2; //number of gradient layers for the triangle
        const colorStep = Math.floor(255 / gradientSteps); //colour increment for gradient

        for (let step = 0; step < gradientSteps; step++) {
            const shapeTipX = Math.round(cx + (object.shapeLength - step * 2) * Math.cos(rad));
            const shapeTipY = Math.round(cy + (object.shapeLength - step * 2) * Math.sin(rad));
            const shapeBase1X = Math.round(cx + (object.shapeRadius + step) * Math.cos(rad + Math.PI / 6));
            const shapeBase1Y = Math.round(cy + (object.shapeRadius + step) * Math.sin(rad + Math.PI / 6));
            const shapeBase2X = Math.round(cx + (object.shapeRadius + step) * Math.cos(rad - Math.PI / 6));
            const shapeBase2Y = Math.round(cy + (object.shapeRadius + step) * Math.sin(rad - Math.PI / 6));

            const gradientColor = [
                Math.min(object.color[0] + step * colorStep, 255),
                Math.min(object.color[1] + step * colorStep, 255),
                Math.min(object.color[2] + step * colorStep, 255),
            ];

            this.#drawThickTriangle(
                shapeBase1X,
                shapeBase1Y,
                shapeBase2X,
                shapeBase2Y,
                shapeTipX,
                shapeTipY,
                gradientColor,
                thickness
            );
        }

        const innerTipX = Math.round(cx + (object.shapeLength / 2) * Math.cos(rad));
        const innerTipY = Math.round(cy + (object.shapeLength / 2) * Math.sin(rad));
        const innerBase1X = Math.round(cx + (object.shapeRadius / 2) * Math.cos(rad + Math.PI / 6));
        const innerBase1Y = Math.round(cy + (object.shapeRadius / 2) * Math.sin(rad + Math.PI / 6));
        const innerBase2X = Math.round(cx + (object.shapeRadius / 2) * Math.cos(rad - Math.PI / 6));
        const innerBase2Y = Math.round(cy + (object.shapeRadius / 2) * Math.sin(rad - Math.PI / 6));

        this.#drawThickTriangle(
            innerBase1X,
            innerBase1Y,
            innerBase2X,
            innerBase2Y,
            innerTipX,
            innerTipY,
            [0, 0, 0], //black for the hollow effect
            thickness
        );
    }

    #drawFunkyShape(cx, cy, rad, object, thickness) {       //draw a pattern with a funky shape
        for (let t = 0; t <= Math.PI * 2; t += 0.05) {
            const px = Math.round(
                cx + object.shapeLength * Math.cos(rad) * Math.cos(t) -
                object.shapeRadius * Math.sin(rad)
            );
            const py = Math.round(
                cy + object.shapeLength * Math.sin(rad) * Math.cos(t) +
                object.shapeRadius * Math.cos(rad) * Math.sin(t)
            );
            this.#drawThickPixel(px, py, object.color, thickness);
        }
    }

    #drawPointedShape(cx, cy, rad, object, thickness) {
        const shapeTipX = Math.round(cx + object.shapeLength * Math.cos(rad));
        const shapeTipY = Math.round(cy + object.shapeLength * Math.sin(rad));
        const shapeBase1X = Math.round(cx + object.shapeRadius * Math.cos(rad + Math.PI / 6));
        const shapeBase1Y = Math.round(cy + object.shapeRadius * Math.sin(rad + Math.PI / 6));
        const shapeBase2X = Math.round(cx + object.shapeRadius * Math.cos(rad - Math.PI / 6));
        const shapeBase2Y = Math.round(cy + object.shapeRadius * Math.sin(rad - Math.PI / 6));

        this.#drawThickTriangle(
            shapeBase1X,
            shapeBase1Y,
            shapeBase2X,
            shapeBase2Y,
            shapeTipX,
            shapeTipY,
            object.color,
            thickness
        );
    }

    #drawThickTriangle(x1, y1, x2, y2, x3, y3, color, thickness) {
        //draw a triangle with thick edges
        this.#drawThickLine(x1, y1, x2, y2, color, thickness);
        this.#drawThickLine(x2, y2, x3, y3, color, thickness);
        this.#drawThickLine(x3, y3, x1, y1, color, thickness);
    }

    #drawThickLine(x1, y1, x2, y2, color, thickness) {
        //draw a thick line between two points
        for (let offset = -Math.floor(thickness / 2); offset <= Math.floor(thickness / 2); offset++) {
            this.#drawLine(x1 + offset, y1 + offset, x2 + offset, y2 + offset, color);
        }
    }

    #drawLine(x1, y1, x2, y2, color) {
        //draw a line between two points using Bresenham's algorithm
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if (x1 >= 0 && x1 < this.display.width && y1 >= 0 && y1 < this.display.height) {
                this.display.setPixel(x1, y1, color);
            }
            if (x1 === x2 && y1 === y2) break;
            const e2 = err * 2;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    #drawThickPixel(x, y, color, thickness) {
        //draw a pixel with a specified thickness
        for (let dx = -Math.floor(thickness / 2); dx <= Math.floor(thickness / 2); dx++) {
            for (let dy = -Math.floor(thickness / 2); dy <= Math.floor(thickness / 2); dy++) {
                const px = x + dx;
                const py = y + dy;
                if (px >= 0 && px < this.display.width && py >= 0 && py < this.display.height) {
                    this.display.setPixel(px, py, color);
                }
            }
        }
    }

    #drawFilledCircle(cx, cy, r, color, thickness) {
        //draw a filled circle with a specified thickness
        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                if (x * x + y * y <= r * r) {
                    this.#drawThickPixel(cx + x, cy + y, color, thickness);
                }
            }
        }
    }

    #updateRandomShapes() {
        //update the position and rotation of each object
        for (const object of this.randomShapes) {
            object.x += object.vx; //move horizontally
            if (object.x < 0) object.x += this.display.width; //wrap around if off-screen
            if (object.x >= this.display.width) object.x -= this.display.width; //wrap around if off-screen
            object.rotation = (object.rotation + object.rotationSpeed) % 360; //update rotation
        }
    }

    update() {
        this.#clearDisplay(); //clear the display
        this.#updateRandomShapes(); //update object positions and rotations
        this.#drawRandomShape(); //draw all objects
        this.display.flush(); //render the updated display
    }
};