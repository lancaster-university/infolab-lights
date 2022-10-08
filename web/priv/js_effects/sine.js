return class MyEffect {
	constructor(display) {
		this.display = display;

		// configure brush
		this.brush_range = 1; // radius of brush stroke
		this.brush_colour = [0, 255, 0]; // colour of the brush stroke

		// configure amplitude
		this.amplitude_max = 0.5; // maximum amplitude in multiples of display height
		this.amplitude = 0; // initial amplitude
		this.amplitude_growing = true; // initial growth direction
		this.amplitude_growth_rate = 0.025; // amplitude growth rate in pixels per frame

		// configure rotation
		this.rotation_angle = 0; // initial angle of rotation
		this.rotation_speed = 0.01; // rate of rotation in radians per frame

		// configure frequency
		this.frequency = 3; // number of pairs of wavelengths on the width of the display

		// other required attributes
		this.offset = 0; // initial offset for lateral movement of the wave
	}

	// set the colour of all pixels to black
	clear() {
		for (let x = 0; x < this.display.width; x++) {
			for (let y = 0; y < this.display.height; y++) {
				this.display.setPixel(x, y, [0, 0, 0]);
			}
		}
	}

	// map a pixel from its original position to its rotated position
	mapPixel(x, y) {
		// translate so the rotation is performed about the centre of the display
		let x_translated = x - this.display.width / 2;
		let y_translated = y - this.display.height / 2;
		// find the sine and cosine values of the angle of rotation
		let sin = Math.sin(this.rotation_angle);
		let cos = Math.cos(this.rotation_angle);
		// use a transformation matrix to rotate, translate back, and quantise the coordinates
		// formula for rotation can be found at https://en.wikipedia.org/wiki/Rotation_matrix
		let x_mapped = Math.round(
			x_translated * cos - y_translated * sin + this.display.width / 2
		);
		let y_mapped = Math.round(
			x_translated * sin + y_translated * cos + this.display.height / 2
		);
		// return the mapped coordinates
		return [x_mapped, y_mapped];
	}

	// create a square of pixels with a given set of centre coordinates, size, and colour
	brush(x_centre, y_centre, range, colour) {
		// traverse the x axis of the square
		for (let x = x_centre - range; x <= x_centre + range; x++) {
			// traverse the y axis of the square
			for (let y = y_centre - range; y <= y_centre + range; y++) {
				// check if the pixel is within the bounds of the display
				if (
					(x >= 0) &
					(y >= 0) &
					(x < this.display.width) &
					(y < this.display.height)
				) {
					this.display.setPixel(x, y, colour);
				}
			}
		}
	}

	// update the display with the pixel data for the newest frame
	update() {
		// increment the angle of rotation
		this.rotation_angle = this.rotation_angle + this.rotation_speed;
		// ensure the angle of rotation remains between 0 and 2 pi radians to avoid large numbers
		if (this.rotation_angle > 2 * Math.PI) {
			this.rotation_angle = this.rotation_angle - 2 * Math.PI;
		}

		// increment the lateral offset of the sine wave
		this.offset++;
		// ensure the lateral offset of the sine wave remains between 0 and the display width to avoid large numbers
		if (this.offset == this.display.width) {
			this.offset = 0;
		}

		// check if the amplitude is increasing or decreasing
		if (this.amplitude_growing) {
			// increase the amplitude by growth rate value
			this.amplitude = this.amplitude + this.amplitude_growth_rate;
			// check if the amplitude will exceed its maximum on the next frame
			if (
				this.amplitude + this.amplitude_growth_rate >
				this.amplitude_max
			) {
				// change the direction of growth
				this.amplitude_growing = false;
			}
		} else {
			// decrease the amplitude by growth rate value
			this.amplitude = this.amplitude - this.amplitude_growth_rate;
			// check if the amplitude will fall below its maximum on the next frame
			if (
				this.amplitude - this.amplitude_growth_rate <
				0 - this.amplitude_max
			) {
				// change the direction of growth
				this.amplitude_growing = true;
			}
		}

		this.clear();

		// traverse the x axis of the display and some more to account for rotation
		for (
			let x = 0 - this.brush_range - this.display.width;
			x < this.display.width + this.brush_range + this.display.width;
			x++
		) {
			// define x as an angle to allow the frequency value to use the correct units
			let x_angle =
				((x + this.offset) / this.display.width) *
				Math.PI *
				2 *
				this.frequency;
			// calculate the change in y value from the average level of motion with a sine function
			let y_change =
				(this.display.height * this.amplitude * Math.sin(x_angle)) / 2;
			// calculate and quantise the y coordinate of the pixel (before mapping)
			let y = Math.round(this.display.height / 2 + y_change);
			let mapped = this.mapPixel(x, y);

			// draw the square on the display at the final (mapped) coordinates
			this.brush(
				mapped[0],
				mapped[1],
				this.brush_range,
				this.brush_colour
			);
		}

		// write the new frame's pixel data to the display
		this.display.flush();
	}
};
