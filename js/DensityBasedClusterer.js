class DensityBasedClusterer {
  constructor() {
    this.dataset = [];
    this.datasetLength = this.dataset.length;
    this.epsilon = 1;
    this.minPts = 2;

    this.clusters = [];
    this.noise = [];

    this.visited = new Array(this.datasetLength);
    this.assigned = new Array(this.datasetLength);
  }

  init(dataset, epsilon, minPts) {
    if(dataset) {
      this.dataset = dataset;
      this.datasetLength = this.dataset.length;
    }
    if(epsilon) this.epsilon = epsilon;
    if(minPts) this.minPts = minPts;

    this.clusters = [];
    this.noise = [];

    this.visited = new Array(this.datasetLength);
    this.assigned = new Array(this.datasetLength);
  }

  run(dataset, epsilon, minPts) {
    this.init(dataset, epsilon, minPts);

    for(let pointId = 0; pointId < this.datasetLength; pointId++) {
      if(this.visited[pointId] !== 1) {
        this.visited[pointId] = 1;

        const neighbors = this.getNeighbors(pointId);
        if(neighbors.length < this.minPts) {
          this.noise.push(pointId);
        } else {
          const clusterId = this.clusters.length;
          this.clusters.push([]);
          this.clusters[clusterId].push(pointId);
          this.assigned[pointId] = 1;

          this.expand(clusterId, neighbors);
        }
      }
    }

    return this.clusters;
  }

  expand(clusterId, neighbors) {
    for(let i = 0; i < neighbors.length; i++) {
      const pointId2 = neighbors[i];

      if(this.visited[pointId2] !== 1) {
        this.visited[pointId2] = 1;
        const neighbors2 = this.getNeighbors(pointId2);

        if(neighbors2.length >= this.minPts) {
          neighbors = this.mergeArrays(neighbors, neighbors2);
        }
      }

      if(this.assigned[pointId2] !== 1) {
        this.clusters[clusterId].push(pointId2);
        this.assigned[pointId2] = 1;
      }
    }
  }

  getNeighbors(pointId) {
    const neighbors = [];

    for(let id = 0; id < this.datasetLength; id++) {
      const dist = this.distance(this.dataset[pointId], this.dataset[id]);
      if(dist < this.epsilon) {
        neighbors.push(id);
      }
    }
    return neighbors;
  }

  mergeArrays(a, b) {
    const len = b.length;
    for(let i = 0; i < len; i++) {
      const p = b[i];
      if(a.indexOf(p) < 0) {
        a.push(p);
      }
    }
    return a;
  }

  distance(p, q) {
    return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]));
  }
}
