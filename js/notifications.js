const notificationContainer = document.getElementById('notification-container');
let notificationId = 0;

export const showNotification = (message, type = 'info', duration = 5000) => {
  const id = `notification-${notificationId++}`;
  
  let messageContent;
  let notificationType = type;
  let notificationDuration = duration;
  
  if (typeof message === 'object') {
    if (message.message) {
      messageContent = message.message;
      if (message.type) notificationType = message.type;
      if (message.duration) notificationDuration = message.duration;
    } else {
      messageContent = JSON.stringify(message);
    }
  } else {
    messageContent = String(message);
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${notificationType}`;
  notification.id = id;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'notification-content';
  contentDiv.textContent = messageContent;

  const closeButton = document.createElement('button');
  closeButton.className = 'close-notification';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';

  notification.appendChild(contentDiv);
  notification.appendChild(closeButton);

  notificationContainer.appendChild(notification);

  closeButton.addEventListener('click', () => {
    removeNotification(id);
  });

  if (notificationDuration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, notificationDuration);
  }

  return id;
};

export const removeNotification = (id) => {
  const notification = document.getElementById(id);
  if (notification) {
    notification.classList.add('fadeout');
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
    }, 300);
  }
};

window.createNotification = showNotification;
window.removeNotification = removeNotification;
