/*
 * Running this will allow you to drag three.js around the screen.
 * 
 * feature requests:
 *  1. add rotation?
 *  2. axis lock
 *  3. inertia dragging
 *  4. activate/deactivate? prevent propagation?
 *
 * @author zz85 from https://github.com/zz85
 * follow on http://twitter.com/blurspline
 */
THREE.DragControls = function(_camera, _objects, _domElement) {

    if (_objects instanceof THREE.Scene) {
        _objects = _objects.children;
    }
    var _projector = new THREE.Projector();

    var _mouse = new THREE.Vector3(),
        _offset = new THREE.Vector3();
    var _selected;

    var p3subp1 = new THREE.Vector3();
    var targetposition = new THREE.Vector3();
    var zerovector = new THREE.Vector3();

    _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    _domElement.addEventListener('mouseup', onDocumentMouseUp, false);


    function onDocumentMouseMove(event) {

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;


        var ray = _projector.pickingRay(_mouse, _camera);

        if (_selected) {
            var normal = _selected.normal;

            // I found this article useful about plane-line intersections
            // http://paulbourke.net/geometry/planeline/

            var denom = normal.dot(ray.direction);
            if (denom == 0) {
                // bail
                console.log('no or infinite solutions');
                return;
            }

            var num = normal.dot(p3subp1.copy(_selected.point).subSelf(ray.origin));
            var u = num / denom;

            targetposition.copy(ray.direction).multiplyScalar(u).addSelf(ray.origin).subSelf(_offset);
            _selected.object.position.copy(targetposition);
            
            return;

        }

        var intersects = ray.intersectObjects(_objects);

        if (intersects.length > 0) {

            _domElement.style.cursor = 'pointer';

        } else {

            _domElement.style.cursor = 'auto';

        }

    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;

        var ray = _projector.pickingRay(_mouse, _camera);
        var intersects = ray.intersectObjects(_objects);
        var normal = _projector.pickingRay(zerovector, _camera).direction; // normal ray to the camera position
        if (intersects.length > 0) {
            _selected = intersects[0];
            _selected.ray = ray;
            _selected.normal = normal ;
            _offset.copy(_selected.point).subSelf(_selected.object.position);

            _domElement.style.cursor = 'move';

        }


    }

    function onDocumentMouseUp(event) {

        event.preventDefault();

        if (_selected) {
            _selected = null;
        }

        _domElement.style.cursor = 'auto';

    }


}