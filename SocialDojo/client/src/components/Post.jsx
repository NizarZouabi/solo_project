import { formatDistanceToNow } from "date-fns";
import { UserContext } from "../context/userContext";
import { useContext, useEffect, useState } from "react";
import Model from "react-modal";
import axios from "axios";
import CommentForm from "./CommentForm";

const Post = (props) => {
  const [commentId, setCommentId] = useState("");
  const { post, user, profilePic, userPosts, setUserPosts } = props;
  const { loggedInUser } = useContext(UserContext);
  const authToken = window.localStorage.getItem("userToken");
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });
  const [errors, setErrors] = useState({});
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [author] = useState(loggedInUser._id);
  const [file, setFile] = useState(null);
  const [visible, setVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);

  const removeFromDom = (postId) => {
    setUserPosts(userPosts.filter((post) => post._id !== postId));
  };

  useEffect(() => {
    if (post) {
      console.log("Post File: ", post.file);
    }
  });

  const removePost = () => {
    axios
      .delete(`http://localhost:5000/posts/${post._id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        removeFromDom(post._id);
        console.log(res);
      })
      .catch((err) => console.log(err));
  };
  
  const deleteComment = (commentId) => {
    axios
      .delete(`http://localhost:5000/posts/${post._id}/remove/comment/${commentId}`,{
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        setUserPosts(prevUserPosts => {
          return prevUserPosts.map(prevPost => {
            if (prevPost._id === post._id) {
              return {
                ...prevPost, comments: prevPost.comments.filter(comment => comment._id !== commentId)};}
            return prevPost;
          });
        });
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const reload = () => window.location.reload();

    const updatedFormData = new FormData();
    updatedFormData.append("title", title);
    updatedFormData.append("content", content);
    updatedFormData.append("author", author);
    updatedFormData.append("file", file);

    axios
      .patch(`http://localhost:5000/posts/${post._id}/update`, updatedFormData ,{
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        setUserPosts([...userPosts, res.data]);
        setTitle("");
        setContent("");
        setFile(null);
        reload();
      })
      .catch((err) => {
        setErrors(err.response.data);
        console.log(err.response.data);
      });
  };

  return (
    <div>
      <div>
        <div
          className="bg-gray-50 mt-48 mb-10 shadow-md border border-solid border-gray-400 rounded-lg position: sticky"
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "29%",
            width: "60%",
          }}
        >
          <div className="bg-gray-200 shadow border-b border-solid border-gray-400 display: flex flex-column align-items-center">
            <span className="border-b border-solid border-gray-400 w-full text-transparent position: absolute top-14 left-0"></span>
            {profilePic &&
            profilePic !==
              "https://avatarfiles.alphacoders.com/239/239030.jpg" ? (
              <img
                className="border border-solid border-gray-400 rounded-full"
                src={`http://localhost:5000/public/images/${profilePic}`}
                style={{
                  position: "sticky",
                  top: "0.1%",
                  left: "0.1%",
                  width: "100px",
                  height: "100px",
                  objectFit: "fill",
                }}
              />
            ) : (
              <img
                className="border border-solid border-gray-400 rounded-full"
                src="https://avatarfiles.alphacoders.com/239/239030.jpg"
                style={{
                  position: "sticky",
                  top: "0.1%",
                  left: "0.1%",
                  width: "10%",
                  height: "23%",
                  objectFit: "fill",
                }}
              />
            )}
            <div className="text-center m-3">
              <h1 className="position: absolute left-32 text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <div className="">
                <div className="position: absolute right-52">
                  {loggedInUser._id == post.author ? (
                    <div>
                      <button
                        className="hover:underline text-sm text-green-600 me-1"
                        onClick={() => setVisible(true)}
                      >
                        Edit
                      </button>
                      <Model
                        ariaHideApp={false}
                        isOpen={visible}
                        onRequestClose={() => setVisible(false)}
                        style={{
                          overlay: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            backdropFilter: "blur(2px)",
                            WebkitBackdropfilter: "blur(2px)",
                          },
                          content: {
                            top: "50%",
                            left: "50%",
                            right: "auto",
                            bottom: "auto",
                            marginRight: "-50%",
                            transform: "translate(-50%, -50%)",
                            borderRadius: "16px",
                          },
                        }}
                      >
                        <button
                          className="pb-1 mt-2 text-sm font-semibold border rounded-md bg-red-500 px-2 hover:bg-red-700 text-white me-7 position: absolute end-0"
                          onClick={() => setVisible(false)}
                        >
                          x
                        </button>
                        <div
                          className="border bg-gray-50"
                          style={{ borderRadius: "16px" }}
                        >
                          <div className="display: flex justify-center">
                            <form
                              className="text-center text-xl py-5"
                              style={{ width: "80%" }}
                              onSubmit={submitHandler}
                            >
                              <div className="display: flex flex-col mb-2">
                                <label className="font-bold text-gray-600">
                                  Title:
                                </label>
                                <input
                                  className="p-1 m-1 border border-gray-400 rounded-lg"
                                  name="title"
                                  value={title}
                                  type="text"
                                  onChange={(e) => setTitle(e.target.value)}
                                />
                                {errors.title ? (
                                  <p className=" text-red-500">
                                    {errors.title.message}
                                  </p>
                                ) : null}
                              </div>
                              <div className="display: flex flex-col mb-2">
                                <label className="font-bold text-gray-600">
                                  Content:
                                </label>
                                <textarea
                                  className="p-1 m-1 border border-gray-400 rounded-lg"
                                  rows={4}
                                  cols={40}
                                  name="content"
                                  value={content}
                                  type="text"
                                  onChange={(e) => setContent(e.target.value)}
                                />
                                {errors.content ? (
                                  <p className=" text-red-500">
                                    {errors.content.message}
                                  </p>
                                ) : null}
                              </div>
                              <div className="mb-2">
                                <label className="text-sm">
                                  Include an image or a video?{" "}
                                </label>
                                <div className="display:flex flex row my-2">
                                  <input
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                    type="file"
                                    name="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                  />
                                  {file ? (
                                    <p className="my-1 border-0 font-semibold block px-2 pt-1 rounded-md text-sm text-green-800 bg-green-200">
                                      Done
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                className="p-1 px-4 font-semibold text-white hover:bg-blue-600 m-1 bg-blue-500 rounded-full w-full shadow-md"
                                type="submit"
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        </div>
                      </Model>
                      <span className="cursor-default">|</span>{" "}
                      <button
                        className="hover:underline text-sm text-red-600"
                        onClick={removePost}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
                <label className="position: absolute right-5 text-gray-500 text-sm italic">
                  {formattedDate}
                </label>
              </div>
              <h3
                className="font-bold"
                style={{ position: "absolute", top: "70px", left: "50%" }}
              >
                {post.title}
              </h3>
            </div>
          </div>
          <div className="bg-gray-50" style={{ height: "100%" }}>
            <div className="">
              <div className="container display: flex flex-row gap-1">
                <div className="container display: flex flex-col">
                  <p
                    className="container w-auto bg-white m-2 p-2 px-4 border border-gray-400 overflow-auto font-semibold"
                    style={{ width: "98.6%", height: "100%" }}
                  >
                    {post.content}
                  </p>
                  <div
                    className="container mt-4 bg-white overflow-x-hidden w-auto m-2 p-2 px-4"
                    style={{ height: "50%" }}
                  >
                    {post.comments.length > 0 ? (
                      post.comments.map((comment, idx) => (
                        <div key={idx} className="display: flex flex-row">
                          {!comment.pfp ? (
                            <img
                              className="border border-solid border-gray-400 rounded-full my-1"
                              src="https://avatarfiles.alphacoders.com/239/239030.jpg"
                              style={{ width: "40px", height: "40px" }}
                            ></img>
                          ) : (
                            <img
                              className="border border-solid border-gray-400 rounded-full my-1"
                              src={`http://localhost:5000/public/images/${comment.pfp}`}
                              style={{ width: "40px", height: "40px" }}
                            ></img>
                          )}
                          <div className=" dislpay: flex flex-col position: sticky left-12" style={{ width: "100%", height: "auto" }}>
                            <h5 className="text-lg font-semibold">
                              {comment.authorName}
                            </h5>
                            <div className="display: flex flex-row">
                              {loggedInUser._id == comment.author ? (<div><p
                                className="container border rounded-lg px-3  bg-white"
                                style={{ height: "auto", minWidth: "50px", maxWidth:"400px"  ,overflowWrap: "break-word" }}
                              >
                                {comment.content}
                              </p><span className="text-red-500 hover:underline cursor-pointer" onClick={() => deleteComment(comment._id)}>Delete</span></div>) : (<p
                                className="container border rounded-lg px-3  bg-white"
                                style={{ height: "auto", minWidth: "50px" , maxWidth:"400px" , overflowWrap: "break-word"}}
                              >
                                {comment.content}
                              </p>)}
                              <div className="display: flex flex-row">
                              <p className="ms-2">0</p>
                              <button className="mb-5">
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Star_empty.svg/2011px-Star_empty.svg.png"
                                  className="position: sticky ms-2"
                                  style={{ height: "30px", width: "30px" }}
                                />
                              </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="position static bottom-24 left-52">
                        <p className="text-center">No comments yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                {post.file ? (
                  <div
                    className="border border-solid border-gray-400  m-2"
                    style={{
                      position: "sticky",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {post.file.endsWith(".mp4") ||
                    post.file.endsWith(".webm") ||
                    post.file.endsWith(".mov") ? (
                      <video
                        controls
                        src={`http://localhost:5000/public/uploads/${post.file}`}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={`http://localhost:5000/public/uploads/${post.file}`}
                        style={{ width: "100%", height: "100%" }}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <span className="border-b border-solid border-gray-400 w-full text-transparent position: absolute bottom-50 left-0"></span>
          </div>
          <div className="display: flex justify-center">
            <div>
              <div className="display: flex flex-row gap-3 mt-4">
                <label className="font-bold text-xl text-gray-600">
                  Comment:
                </label>
                <input
                  className="shadow-md border border-solid border-gray-400 rounded-lg"
                  type="text"
                  style={{ height: "3.5vh"}}
                  onClick={() => setCommentVisible(true)}
                />
                <div className="display: flex flex-row">
                              <p className="ms-2">0</p>
                              <button className="mb-5">
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Star_empty.svg/2011px-Star_empty.svg.png"
                                  className="position: sticky ms-2"
                                  style={{ height: "30px", width: "30px" }}
                                />
                              </button>
                              </div>
                <Model
                  ariaHideApp={false}
                  isOpen={commentVisible}
                  onRequestClose={() => setCommentVisible(false)}
                  style={{
                    overlay: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(2px)",
                      WebkitBackdropfilter: "blur(2px)",
                    },
                    content: {
                      top: "50%",
                      left: "50%",
                      right: "auto",
                      bottom: "auto",
                      marginRight: "-50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "16px",
                    },
                  }}
                >
                  <button
                    className="pb-1 text-sm font-semibold border rounded-md bg-red-500 px-2 hover:bg-red-700 text-white mt-2 me-7 position: absolute end-0"
                    onClick={() => setCommentVisible(false)}
                  >
                    x
                  </button>
                  <CommentForm
                    postId={post._id}
                    userPosts={userPosts}
                    setUserPosts={setUserPosts}
                  />
                </Model>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
