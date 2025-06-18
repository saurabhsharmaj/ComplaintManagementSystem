import { useEffect, useState } from "react";
import { fetchUserById } from "../utils/mongodb";

const CommentsTile = ({ comment }) => {
  const [commentAuthor, setCommentAuthor] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (comment?.author && token) {
      fetchUserById(comment.author, token)
        .then((user) => {
          setCommentAuthor(user);
        })
        .catch((err) => {
          console.error("Failed to fetch comment author", err);
        });
    }
  }, [comment]);

  const timeStamp = new Date(comment.timestamp);
  const date = timeStamp.toLocaleDateString();
  const time = timeStamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex justify-between items-center w-full">
        <div className="h-10 w-10 flex justify-center items-center rounded-full overflow-hidden bg-gray-200">
          <img
            src={
              commentAuthor?.mediaPath?.buffer
                ? `data:image/png;base64,${commentAuthor.mediaPath.buffer}`
                : "/default-avatar.png"
            }
            alt="Author"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col px-4 w-full">
          <div className="flex justify-between w-full text-sm font-medium">
            <p>{comment.text}</p>
            <p>{commentAuthor?.name || "Loading..."}</p>
            <p>{`${date}, ${time}`}</p>
          </div>
          <p className="text-gray-600 mt-1">{comment.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentsTile;
