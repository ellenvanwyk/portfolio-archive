var Node = function(x, y) {
    this.x = x;
    this.y = y;
    this.connections = [];
    this.rendered = false;
}

Node.prototype.distance = function(node) {
	var dx = node.x - this.x;
	var dy = node.y - this.y;
	return Math.sqrt(dx*dx+dy*dy);
}

var Web = function(width, height, numNodes, minConnectD, maxConnectD, minSpacing) {
	this.w = width;
	this.h = height;
	this.rootNode = new Node(width/2, height/2);
	this.nodes = [this.rootNode];
	this.r = Math.min(this.w/2, this.h/2);

	this.minConnectD = minConnectD;
	this.maxConnectD = maxConnectD;
	this.minSpacing = minSpacing;

	this.numNodes = numNodes;

	this.batchSize = 8;

	this.spread = 0.0;
	this.innerR = 0.05;
	this.outerR = 0.95;

	this.expand = function() {
		var nNodes = 1;

		for (var i = 0; i < this.batchSize; i++) {
			if(this.nodes.length == this.numNodes)
				return;

			var t = Math.pow(this.nodes.length / (this.numNodes - 1), 0.55);
			var minR = this.r * (this.innerR + t * (this.outerR - this.innerR - this.spread));
			var maxR = minR + this.r * this.spread;
			this.addNode(0, 2 * Math.PI, minR, maxR, this.r * this.minConnectD, this.r * this.maxConnectD, this.r * this.minSpacing, 8);
		}
	}

	this.addNode = function(minA, maxA, minR, maxR, minC, maxC, minD, maxConnections) {
		for (var i = 0; i < 10; i++) {
			var node = this.createNode(0, 2 * Math.PI, minR, maxR);
			var success = this.connectNode(node, minC, maxC, minD, maxConnections);
			if(success) {
				this.nodes.push(node);
				return true;
			}
		};
		return false;
	}

	this.createNode = function(minA, maxA, minR, maxR) {
		var a = minA + Math.random() * (maxA - minA);
		var d = minR + Math.random() * (maxR - minR);
		var node = new Node(this.rootNode.x + d * Math.cos(a),
							this.rootNode.y + d * Math.sin(a));
		return node;
	}

	this.connectNode = function(node, minC, maxC, minD, maxConnections) {
		for (var i = 0; i < this.nodes.length; i++) {
			var otherNode = this.nodes[i];
			var d = node.distance(otherNode);
			if(d < minD)
				return false;

			if(d >= minC && d <= maxC) {
				node.connections.push(otherNode);
			}
			if(node.connections.length >= maxConnections)
				return true;
		}
		return true;
	}
}

var WebRenderer = function(web, canvas) {
	this.canvas = canvas;
	this.web = web;

	this.drawNode = function(node, c) {
		for (var i = 0; i < node.connections.length; i++) {
			var neighbor = node.connections[i];
			c.moveTo(node.x, node.y);
			c.lineTo(neighbor.x, neighbor.y);
      

		};
	};

	this.render = function() {
		var c = this.canvas.getContext("2d");
		c.strokeStyle = 'rgba(0,0,0, 0.1)';
		c.lineWidth = 1;
		c.beginPath();
		for (var i = 0; i < web.nodes.length; i++) {
			if(!web.nodes[i].rendered) {
				this.drawNode(web.nodes[i], c);
				web.nodes[i].rendered = true;
			}
		};
		c.stroke();
	};

	this.clearCanvas = function() {
		var c = this.canvas.getContext("2d");
		c.clearRect(0,0, this.canvas.width, this.canvas.height);
	};
}
