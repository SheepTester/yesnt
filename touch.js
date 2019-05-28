let usingTouch = false;
let touchMovement = null;

function initTouch() {
  const touchUI = document.getElementById('touch-ui');
  const touchCircle = document.getElementById('touch-circle');

  let cameraRotator = null;
  let movement = null;
  function calcMovementFromTouch(touch) {
    touchMovement = new THREE.Vector2((touch.clientX - movement.centreX) / 40, (touch.clientY - movement.centreY) / 40);
    if (touchMovement.lengthSq() > 1) touchMovement.normalize();
    touchCircle.style.setProperty('--x', touchMovement.x * 40 + 'px');
    touchCircle.style.setProperty('--y', touchMovement.y * 40 + 'px');
  }
  document.addEventListener('touchstart', e => {
    if (e.target.closest('.clickable')) return;
    document.body.classList.add('hide-options');
    if (!usingTouch) {
      usingTouch = true;
      touchUI.classList.add('using-touch');
      userInteracted();
    }
    for (const touch of e.changedTouches) {
      if (touch.target.classList.contains('touch-target')) {
        if (touch.target === touchCircle && !movement) {
          const rect = touchCircle.getBoundingClientRect();
          movement = {
            identifier: touch.identifier,
            centreX: rect.left + rect.width / 2,
            centreY: rect.top + rect.height / 2
          };
          touchCircle.classList.add('moving');
          calcMovementFromTouch(touch);
        } else if (touch.target.dataset.simKey) {
          const key = touch.target.dataset.simKey;
          keys[key] = true;
          if (onKeyPress[key]) onKeyPress[key]();
        }
      } else if (!cameraRotator) {
        cameraRotator = {
          identifier: touch.identifier,
          lastX: touch.clientX,
          lastY: touch.clientY
        };
      }
    }
    e.preventDefault();
  }, {passive: false});
  document.addEventListener('touchmove', e => {
    for (const touch of e.changedTouches) {
      if (cameraRotator && cameraRotator.identifier === touch.identifier) {
        rotateCamera((touch.clientX - cameraRotator.lastX) / options.touchSensitivity, (touch.clientY - cameraRotator.lastY) / options.touchSensitivity);
        cameraRotator.lastX = touch.clientX;
        cameraRotator.lastY = touch.clientY;
      } else if (movement && movement.identifier === touch.identifier) {
        calcMovementFromTouch(touch);
      }
    }
    e.preventDefault();
  }, {passive: false});
  document.addEventListener('touchend', e => {
    for (const touch of e.changedTouches) {
      if (cameraRotator && cameraRotator.identifier === touch.identifier) {
        cameraRotator = null;
      } else if (movement && movement.identifier === touch.identifier) {
        touchMovement = null;
        movement = null;
        touchCircle.classList.remove('moving');
      } else if (touch.target.dataset.simKey) {
        keys[touch.target.dataset.simKey] = false;
      }
    }
    e.preventDefault();
  }, {passive: false});
}
