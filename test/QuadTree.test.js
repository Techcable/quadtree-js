const {Point, Box, QuadTree} = require('..');

function rand(max, min = 0) {
    return Math.floor(Math.random() * (max - min)) + min;
}

describe('Class QuadTree', () => {
    describe('constructor', () => {

        test('sets attribute container', () => {
            const container = new Box(0, 0, 1000, 2000);
            const qt = new QuadTree(container);

            expect(qt._container).toEqual(container);
        });

        test('sets optional attribute config.capacity', () => {
            const qt = new QuadTree(new Box(0, 0, 1000, 2000), {capacity: 10});

            expect(qt._config.capacity).toEqual(10);
        });

        test('sets optional attribute config.removeEmptyNodes', () => {
            const qt = new QuadTree(new Box(0, 0, 1000, 2000), {removeEmptyNodes: true});

            expect(qt._config.removeEmptyNodes).toBeTruthy();
        });

        test('sets optional attribute points', () => {
            const points = [new Point(0, 0), new Point(1, 1)];
            const qt = new QuadTree(new Box(0, 0, 1000, 2000), {capacity: 4}, points);

            expect(qt._points).toEqual(points);
        });

        test('default value config.capacity', () => {
            const qt = new QuadTree(new Box(0, 0, 1000, 2000));

            expect(qt._config.capacity).toEqual(4);
        });

        test('default value config.removeEmptyNodes', () => {
            const qt = new QuadTree(new Box(0, 0, 1000, 2000));

            expect(qt._config.removeEmptyNodes).toBeFalsy();
        });

        test('default value points', () => {
            const qt = new QuadTree(new Box(0, 0, 1000, 2000));

            expect(qt._points).toEqual([]);
        });
    });

    describe('insert + getAllPoints', () => {
        describe('insert several single points', () => {
            const points = [], xMax = 1000, yMax = 1000;
            const qt = new QuadTree(new Box(0, 0, xMax, yMax));

            for (let i = 0; i < 100; i++) {
                const point = new Point(rand(xMax - 1, 1), rand(yMax - 1, 1));

                points.push(point);
                qt.insert(point);
            }

            const allPoints = qt.getAllPoints();

            test('Result length should be the same', () => {
                expect(allPoints.length).toBeGreaterThanOrEqual(points.length);
            });

            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                test(`Point (x:${point.x}, y:${point.y}) is in the results`, () => {
                    expect(allPoints).toContainEqual(point);
                });
            }
        });


        describe('insert array of points', () => {
            const points = [], xMax = 1000, yMax = 1000;
            const qt = new QuadTree(new Box(0, 0, xMax, yMax));

            for (let i = 0; i < 100; i++) {
                const point = new Point(rand(xMax - 1, 1), rand(yMax - 1, 1));

                points.push(point);
            }

            qt.insert(points);

            const allPoints = qt.getAllPoints();

            test('Result length should be the same', () => {
                expect(allPoints.length).toBeGreaterThanOrEqual(points.length);
            });

            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                test(`Point (x:${point.x}, y:${point.y}) is in the results`, () => {
                    expect(allPoints).toContainEqual(point);
                });
            }
        });


        describe('insert point outside of range', () => {
            test('test with one point', () => {
                const xMax = 1000, yMax = 1000;
                const qt = new QuadTree(new Box(0, 0, xMax, yMax));

                const point = new Point(xMax * 2, yMax * 2);
                qt.insert(point);

                const allPoints = qt.getAllPoints();

                expect(allPoints).not.toContain(point);
            });
        });
    });

    describe('query Box 1', () => {
        const xMax = 1000, yMax = 1000;
        const qt = new QuadTree(new Box(0, 0, xMax, yMax));

        const xZone = rand(xMax);
        const yZone = rand(yMax);
        const wZone = rand(xMax - xZone);
        const hZone = rand(yMax - yZone);

        const zone = new Box(xZone, yZone, wZone, hZone);

        const pointsIn = [];
        const pointsOut = [];

        for (let i = 0; i < 100; i++) {
            const point = new Point(rand(xMax - 1, 1), rand(yMax - 1, 1));

            if (zone.contains(point)) {
                pointsIn.push(point);
            } else {
                pointsOut.push(point);
            }

            qt.insert(point);
        }

        const results = qt.query(zone);

        for (const point of pointsIn) {
            test(`Point (x:${point.x}, y:${point.y}) is in the results`, () => {
                expect(results).toContainEqual(point);
            });
        }
    });

    describe('remove a single point', () => {
        const points = [], xMax = 1000, yMax = 1000;
        const qt = new QuadTree(new Box(0, 0, xMax, yMax));

        for (let i = 0; i < 100; i++) {
            const point = new Point(rand(xMax - 1, 1), rand(yMax - 1, 1));

            points.push(point);
            qt.insert(point);
        }

        const index = rand(points.length);

        qt.remove(points[index]);

        test('point is removed', () => {
            expect(qt.getAllPoints()).not.toContainEqual(points[index]);
        });

    });


    describe('remove an array of points', () => {
        const points = [], xMax = 1000, yMax = 1000;
        const qt = new QuadTree(new Box(0, 0, xMax, yMax));

        for (let i = 0; i < 100; i++) {
            const point = new Point(rand(xMax - 1, 1), rand(yMax - 1, 1));

            points.push(point);
            qt.insert(point);
        }

        const rmPoints = points.slice(0, points.length / 2);

        qt.remove(rmPoints);

        const allPoints = qt.getAllPoints();

        for (let i = 0; i < rmPoints.length; i++) {
            const point = rmPoints[i];

            test('point is removed', () => {
                expect(allPoints).not.toContainEqual(point);
            });
        }

    });


    describe('clear', () => {
        test('QT must be clean after clear', () => {
            const xMax = 1000, yMax = 1000;
            const qt = new QuadTree(new Box(0, 0, xMax, yMax));
            const qtTest = new QuadTree(new Box(0, 0, xMax, yMax));

            for (let i = 0; i < 100; i++) {
                const point = new Point(rand(xMax - 1, 1), rand(yMax - 1, 1));

                qt.insert(point);
            }

            expect(qt).not.toEqual(qtTest);
            qt.clear();
            expect(qt).toEqual(qtTest);
        });
    });


    describe('getTree', () => {
        test('with one point', () => {
            const qt = new QuadTree(new Box(0, 0, 10, 10));

            qt.insert(new Point(5, 5));

            expect(qt.getTree()).toEqual(1);
        });

        test('with several points', () => {
            const qt = new QuadTree(new Box(0, 0, 10, 10));

            qt.insert(new Point(5, 5));
            qt.insert(new Point(6, 5));
            qt.insert(new Point(4, 5));
            qt.insert(new Point(3, 5));
            qt.insert(new Point(2, 5));
            qt.insert(new Point(1, 5));

            const result = {ne: 2, nw: {ne: 0, nw: 0, se: 3, sw: 2}, se: 2, sw: 3};

            expect(qt.getTree()).toEqual(result);
        })
    });
});


