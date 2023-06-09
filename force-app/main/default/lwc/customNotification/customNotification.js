import { LightningElement, api } from "lwc";

const CLASSES = {
  error: "errorBorder",
  success: "successBorder",
  notice: "noticeBorder"
};

export default class CustomNotification extends LightningElement {
  @api
  notificationInfo = {
    type: "success",
    text: "Notification"
  };

  get classMessage() {
    let notificationClass = CLASSES.notice;

    Object.keys(CLASSES).forEach((type) => {
      if (type === this.notificationInfo.type) {
        notificationClass = CLASSES[type];
      }
    });

    return 'notificationCustomComponent ' + notificationClass;
  }
}
