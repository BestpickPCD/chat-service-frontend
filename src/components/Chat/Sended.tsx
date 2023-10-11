import moment from "moment";
import React, { memo, useEffect, useState } from "react";

const Sended = ({ chatArr, sentOrSeen }: any) => {
  const [timeAgo, setTimeAgo] = useState("");
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    if (chatArr && chatArr?.length) {
      const selfMessages = chatArr.filter((message: any) => message?.self);
      if (selfMessages.length) {
        setLastMessage(selfMessages[selfMessages.length - 1].createdAt);
      }
    }
  }, [chatArr]);

  useEffect(() => {
    if (!!lastMessage) {
      let intervalId: any;
      intervalId = setInterval(() => {
        const currentTime: any = moment(new Date()).utc().valueOf();
        const sentTime: any = moment(lastMessage).valueOf();
        const diffInMilliseconds = currentTime - sentTime;
        const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
        if (diffInMinutes < 60) {
          setTimeAgo(
            `${diffInMinutes} ${diffInMinutes > 1 ? "mins" : "min"} ago`
          );
        } else if (diffInMinutes < 24 * 60) {
          const hours = Math.floor(diffInMinutes / 60);
          setTimeAgo(`${hours} ${hours > 1 ? "hours" : "hour"} ago`);
        } else {
          const days = Math.floor(diffInMinutes / (24 * 60));
          setTimeAgo(`${days} ${days > 1 ? "days" : "day"} ago`);
        }
      }, 10000);
      return () => clearInterval(intervalId);
    }
  }, [lastMessage]);

  return (
    <>
      {sentOrSeen} {sentOrSeen === "Sent" && timeAgo}
    </>
  );
};

export default memo(Sended);
