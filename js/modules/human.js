class Human {
	place(_x, _y) {
		ctx.beginPath();
		ctx.fillStyle = '#1e824c';
		ctx.arc(_x, _y, 10, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
		
		this.x = _x;
		this.y = _y;

		this.direction = {x : 0, y: 0};
	}

	setDirection() {
		let distToExit = [];

		for (let i = 0; i < exits.length; i ++) {
			// Для вертикальных выходов
			if (exits[i].dx == 0) {
				let _dx = exits[i].x1 - this.x;
				let _dy = randomInt(exits[i].y1 + 15, exits[i].y2 - 15) - this.y;
				let _m = Math.sqrt(Math.pow(_dx, 2) + Math.pow(_dy, 2));
				let _a = Math.atan2(_dy, _dx);

				let isClear = true;

				for (let j = 0; j < walls.length; j ++) {
					let crossdot = Vector.crossing({
							x1 : this.x,
							y1 : this.y,

							x2 : this.x + _dx,
							y2 : this.y + _dy
						}, walls[j]);

					if (((crossdot.x >= this.x && crossdot.x <= exits[i].x1) || (crossdot.x <= this.x && crossdot.x >= exits[i].x1)) && crossdot.x >= walls[j].x1 - 1 && crossdot.x <= walls[j].x2 + 1 && crossdot.y >= walls[j].y1 - 1 && crossdot.y <= walls[j].y2 + 1) {
						isClear = false;

						break;
					}
				}

				if (isClear) {
					if (this.y >= exits[i].y1 + 15 && this.y <= exits[i].y2 - 15) {
						let _minY = this.y - 20 < exits[i].y1 + 15 ? exits[i].y1 : this.y - 20;
						let _maxY = this.y + 20 > exits[i].y2 - 15 ? exits[i].y2 : this.y + 20;
						let _y;

						if (Math.abs(_dx) > 20) {
							_y = randomInt(_minY, _maxY); 
						} else {
							_y = this.y;
						}
						

						distToExit[i] = {
							dx : exits[i].x1 - this.x,
							dy : _y - this.y,
							module : Math.abs(exits[i].x1 - this.x),
							angle : Math.atan2(0, exits[i].x1 - this.x)
						}
					} else {
						distToExit[i] = {
							dx : _dx,
							dy : _dy,
							module : _m,
							angle : _a
						}
					}
				} else {
					distToExit[i] = {
						dx : 1,
						dy : 0,
						module : 9e10,
						angle : 0
					}
				}
			}

			// Для горизонтальных выходов
			if (exits[i].dy == 0) {
				let _dx = randomInt(exits[i].x1 + 15, exits[i].x2 - 15) - this.x;
				let _dy = exits[i].y1 - this.y;
				let _m = Math.sqrt(Math.pow(_dx, 2) + Math.pow(_dy, 2));
				let _a = Math.atan2(_dy, _dx);

				let isClear = true;

				for (let j = 0; j < walls.length; j ++) {
					let crossdot = Vector.crossing({
							x1 : this.x,
							y1 : this.y,

							x2 : this.x + _dx,
							y2 : this.y + _dy
						}, walls[j]);

					if (((crossdot.y >= this.y && crossdot.y <= exits[i].y1) || (crossdot.y <= this.y && crossdot.y >= exits[i].y1)) && crossdot.x >= walls[j].x1 - 1 && crossdot.x <= walls[j].x2 + 1 && crossdot.y >= walls[j].y1 - 1 && crossdot.y <= walls[j].y2 + 1) {
						isClear = false;

						break;
					}
				}

				if (isClear) {
					if (this.x >= exits[i].x1 + 15 && this.x <= exits[i].x2 - 15) {
						let _minX = this.x - 20 < exits[i].x1 + 15 ? exits[i].x1 : this.x - 20;
						let _maxX = this.x + 20 > exits[i].x2 - 15 ? exits[i].x2 : this.x + 20;
						let _x;

						if (Math.abs(_dy) > 20) {
							_x = randomInt(_minX, _maxX);
						} else {
							_x = this.x;
						}

						distToExit[i] = {
							dx : _x - this.x,
							dy : exits[i].y1 - this.y,
							module : Math.abs(exits[i].y1 - this.y),
							angle : Math.atan2(exits[i].y1 - this.y, 0)
						}
					} else {
						distToExit[i] = {
							dx : _dx,
							dy : _dy,
							module : _m,
							angle : _a
						}
					}
				} else {
					distToExit[i] = {
						dx : 1,
						dy : 0,
						module : 9e10,
						angle : 0
					}
				}
			}
		}

		this.direction = {dx : null, dy : null, module : Math.sqrt(WIDTH * WIDTH + HEIGHT * HEIGHT), angle : null};

		for (let i = 0; i < distToExit.length; i ++) {
			if (Math.abs(distToExit[i].module) < Math.abs(this.direction.module)) {
				// Для вертикальных выходов
				if (exits[i].dx == 0) {
					// Для выходов влево
					if (exits[i].direction == 'left') {
						// Если индивид справа от выхода
						if (this.x > exits[i].x1) {
							this.direction = distToExit[i];
						} else {
							// Делаем перебор по выходам и стенам, и если это крайний к границе холста, то уходим в нее
							let leftX = WIDTH;

							for (let j = 0; j < walls.length; j ++) {
								if (walls[j].x1 < leftX)
									leftX = walls[j].x1
							}

							for (let j = 0; j < exits.length; j ++) {
								if (exits[j].x1 < leftX)
									leftX = exits[j].x1;
							}

							if (this.x <= leftX + 15) {
								this.direction.dx = -1;
								this.direction.dy = 0;

								break;
							}
						}
					} 

					// Для выходов вправо
					if (exits[i].direction == 'right') {
						// Если индивид слева от выхода
						if (this.x < exits[i].x1) {
							this.direction = distToExit[i];
						} else {
							// Делаем перебор по выходам и стенам, и если это крайний к границе холста, то уходим в нее
							let rightX = 0;

							for (let j = 0; j < walls.length; j ++) {
								if (walls[j].x1 > rightX)
									rightX = walls[j].x1;
							}

							for (let j = 0; j < exits.length; j ++) {
								if (exits[j].x1 > rightX)
									rightX = exits[j].x1;
							}

							if (this.x >= rightX - 15) {
								this.direction.dx = 1;
								this.direction.dy = 0;

								break;
							}
						}
					}
				}

				// Для горизонтальных выходов
				if (exits[i].dy == 0) {
					// Для выходов вверх
					if (exits[i].direction == 'up') {
						// Если индивид снизу от выхода
						if (this.y > exits[i].y1) {
							this.direction = distToExit[i];
						} else {
							// Делаем перебор по выходам и стенам, и если это крайний к границе холста, то уходим в нее
							let upY = HEIGHT;

							for (let j = 0; j < walls.length; j ++) {
								if (walls[j].y1 < upY)
									upY = walls[j].y1;
							}

							for (let j = 0; j < exits.length; j ++) {
								if (exits[j].y1 < upY)
									upY = exits[j].y1;
							}

							if (this.y <= upY + 15) {
								this.direction.dx = 0;
								this.direction.dy = -1;

								break;
							}
						}
					} 

					// Для выходов вниз
					if (exits[i].direction == 'down') {
						// Если индивид сверху от выхода
						if (this.y < exits[i].y1) {
							this.direction = distToExit[i];
						} else {
							// Делаем перебор по выходам и стенам, и если это крайний к границе холста, то уходим в нее
							let downY = 0;

							for (let j = 0; j < walls.length; j ++) {
								if (walls[j].y1 > downY)
									downY = walls[j].y1;
							}

							for (let j = 0; j < exits.length; j ++) {
								if (exits[j].y1 > downY)
									downY = exits[j].y1;
							}

							if (this.y >= downY - 15) {
								this.direction.dx = 0;
								this.direction.dy = 1;

								break;
							}
						}
					}
				}
			}
		}

		if(showVectors) {
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;

			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + this.direction.dx, this.y + this.direction.dy);

			ctx.stroke();
			ctx.closePath();
		}
	}

	setVelocity() {

		this.dV = {dx : 0, dy : 0, module : 0, angle : 0};

		let _dx;
		let _dy;

		_dx = this.direction.dx;
		_dy = this.direction.dy;

		this.dV.module = 6;
		this.dV.angle = Math.atan2(_dy, _dx);

		this.dV.dx = this.dV.module * Math.cos(this.dV.angle);
		this.dV.dy = this.dV.module * Math.sin(this.dV.angle);
	}

	setHumansDistances(_humans) {
		this.distToHuman = [];
		this.normal_h = [];
		this.tau_h = [];

		for (let i = 0; i < _humans.length; i++) {
			if (_humans[i] != this) {
				this.distToHuman[i] = {dx : 0, dy : 0, module : 0, angle : 0}; 
				this.normal_h[i] = {dx : 0, dy : 0, module : 0, angle : 0}; 
				this.tau_h[i] = {dx : 0, dy : 0, module : 0, angle : 0}; 

				this.distToHuman[i].dx = _humans[i].x - this.x;
				this.distToHuman[i].dy = _humans[i].y - this.y;

				this.distToHuman[i].module = Math.sqrt(Math.pow(this.distToHuman[i].dx, 2) + Math.pow(this.distToHuman[i].dy, 2));
				this.distToHuman[i].angle = Math.atan2(this.distToHuman[i].dy, this.distToHuman[i].dx);

				this.normal_h[i].dx = Math.cos(this.distToHuman[i].angle);
				this.normal_h[i].dy = Math.sin(this.distToHuman[i].angle);

				this.tau_h[i].dx = - this.normal_h[i].dy;
				this.tau_h[i].dy = this.normal_h[i].dx;
			} else {
				this.distToHuman[i] = {dx : 0, dy : 0}; 
			}
		}
	}

	setWallsDistances(_walls) {
		this.distToWall = [];
		this.normal_w = [];
		this.tau_w = [];

		for (let i = 0; i < _walls.length; i ++) {
			this.distToWall[i] = {dx : 0, dy : 0, module : 0};
			this.normal_w[i] = {dx : 0, dy : 0, module : 0, angle : 0}; 
			this.tau_w[i] = {dx : 0, dy : 0, module : 0, angle : 0}; 

			if (_walls[i].dx == 0) {
				if (this.y > _walls[i].y1 && this.y < _walls[i].y2) {
					this.distToWall[i].dx = _walls[i].x1 - this.x;

					this.normal_w[i].dx = (_walls[i].x1 - this.x) / Math.abs(_walls[i].x1 - this.x);

				} else {
					this.distToWall[i].dx = 0;
				}
			} else if (_walls[i].dy == 0) {
				if (this.x > _walls[i].x1 && this.x < _walls[i].x2) {
					this.distToWall[i].dy = _walls[i].y1 - this.y;

					this.normal_w[i].dy = (_walls[i].y1 - this.y) / Math.abs(_walls[i].y1 - this.y);
				} else {
					this.distToWall[i].dy = 0;
				}
			}

			this.tau_w[i].dx = -this.normal_w[i].dy;
			this.tau_w[i].dy = this.normal_w[i].dx;

			this.distToWall[i].module = Math.sqrt(Math.pow(this.distToWall[i].dx, 2) + Math.pow(this.distToWall[i].dy, 2));
		}
	}

	F_2(_humans) {
		this.f_2 = [];

		for (let i = 0; i < _humans.length; i++) {
			if (_humans[i] != this) {
				this.f_2[i] = {dx : 0, dy : 0, module : 0, angle : 0};

				this.f_2[i].module = A_h * Math.exp(this.distToHuman[i].module / B_h);
				this.f_2[i].angle = Math.atan2(this.distToHuman[i].dy, this.distToHuman[i].dx);

				this.f_2[i].dx = this.f_2[i].module * Math.cos(this.f_2[i].angle);
				this.f_2[i].dy = this.f_2[i].module * Math.sin(this.f_2[i].angle);
			} else {
				this.f_2[i] = {dx : 0, dy : 0, module : 0, angle : 0};
			}
		}
	}

	F_3(_humans) {
		this.f_3 = [];

		for (let i = 0; i < _humans.length; i++) {
			if (_humans[i] != this) {
				this.f_3[i] = {dx : 0, dy : 0, module : 0, angle : 0};

				this.f_3[i].dx = this.distToHuman[i].module * Heaviside(20 - this.distToHuman[i].module) * (k1 * this.normal_h[i].dx + k2 * Vector.scalar(this.dV, this.tau_h[i]) * this.tau_h[i].dx);
				this.f_3[i].dy = this.distToHuman[i].module * Heaviside(20 - this.distToHuman[i].module) * (k1 * this.normal_h[i].dy + k2 * Vector.scalar(this.dV, this.tau_h[i]) * this.tau_h[i].dy);
			} else {
				this.f_3[i] = {dx : 0, dy : 0, module : 0, angle : 0};
			}
		}
	}

	F_4(_walls) {
		this.f_4 = [];

		for (let i = 0; i < _walls.length; i++) {
			this.f_4[i] = {dx : 0, dy : 0, module : 0, angle : 0};

			this.f_4[i].dx = this.distToWall[i].dx * A_w * Math.exp(this.distToWall[i].module / B_w);
			this.f_4[i].dy = this.distToWall[i].dy * A_w * Math.exp(this.distToWall[i].module / B_w);
		}
	}

	F_5(_walls) {
		this.f_5 = [];

		for (let i = 0; i < _walls.length; i ++) {
			this.f_5[i] = {dx : 0, dy : 0, module : 0, angle : 0};

			this.f_5[i].dx = this.distToWall[i].module * Heaviside(10 - this.distToWall[i].module) * (k1 * this.normal_w[i].dx + k2 * Vector.scalar(this.dV, this.tau_w[i]) * this.tau_w[i].dx);
			this.f_5[i].dy = this.distToWall[i].module * Heaviside(10 - this.distToWall[i].module) * (k1 * this.normal_w[i].dy + k2 * Vector.scalar(this.dV, this.tau_w[i]) * this.tau_w[i].dy);
		}
	}

	acceleration() {
		let sum_1;
		let sum_2;
		let sum_3;
		let sum_4;
		let sum_5;
		let sum_6;

		sum_2 = Vector.sum(this.f_2);

		if(showVectors) {
			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 2;
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + 100 * sum_2.dx, this.y + 100 * sum_2.dy);
			ctx.stroke();
			ctx.closePath();
		}

		sum_3 = Vector.sum(this.f_3);

		if(showVectors) {
			ctx.beginPath();
			ctx.strokeStyle = 'green';
			ctx.lineWidth = 2;
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + 100 * sum_3.dx, this.y + 100 * sum_3.dy);
			ctx.stroke();
			ctx.closePath();
		}

		sum_4 = Vector.sum(this.f_4);

		if(showVectors) {
			ctx.beginPath();
			ctx.strokeStyle = 'blue';
			ctx.lineWidth = 2;
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + 100 * sum_4.dx, this.y + 100 * sum_4.dy);
			ctx.stroke();
			ctx.closePath();
		}

		sum_5 = Vector.sum(this.f_5);

		if(showVectors) {
			ctx.beginPath();
			ctx.strokeStyle = 'yellow';
			ctx.lineWidth = 2;
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + 100 * sum_5.dx, this.y + 100 * sum_5.dy);
			ctx.stroke();
			ctx.closePath();
		}

		sum_6 = Vector.sum([sum_2, sum_3, sum_4, sum_5, this.dV]);

		if(showVectors) {
			ctx.beginPath();
			ctx.strokeStyle = 'violet';
			ctx.lineWidth = 2;
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + 10 * sum_6.dx, this.y + 10 * sum_6.dy);
			ctx.stroke();
			ctx.closePath();
		}

		this.mainVector = sum_6;
	}

	move() {
		this.velocity = speed* .08;
		this.x = this.x + this.velocity * this.mainVector.dx;
		this.y = this.y + this.velocity * this.mainVector.dy;

		ctx.beginPath();
		ctx.fillStyle = '#1e824c';
		ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}

	deleteEscaped(_humans) {
		for (let i = 0; i < _humans.length; i ++) {
			if (_humans[i].y > HEIGHT || _humans[i].y < 0 || _humans[i].x > WIDTH || _humans[i].x < 0) {
				this.f_2[i] = {dx : 0, dy : 0, module : 0, angle : 0};
				this.f_3[i] = {dx : 0, dy : 0, module : 0, angle : 0};

				escapedNumber ++;
			}
		}
	}
}