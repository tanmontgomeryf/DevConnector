import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  EDIT_POST,
  GET_POST,
  ADD_COMMENT,
  REMOVE_COMMENT,
  EDIT_COMMENT,
} from './types';

//Get posts
export const getPosts = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/posts');

    dispatch({
      type: GET_POSTS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

//Add Like
export const addLike = (id) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/posts/${id}/like`);

    dispatch({
      type: UPDATE_LIKES,
      payload: { id, likes: res.data },
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
    console.log(error.response);
  }
};

//remove like
export const removeLike = (id) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/posts/${id}/unlike`);

    dispatch({
      type: UPDATE_LIKES,
      payload: { id, likes: res.data },
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};

//delete post
export const deletePost = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/posts/${id}`);

    dispatch({
      type: DELETE_POST,
      payload: id,
    });

    dispatch(setAlert('Post Removed', 'success'));
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};

//add post
export const addPost = (formData) => async (dispatch) => {
  const config = {
    header: {
      'content-type': 'application/json',
    },
  };
  try {
    const res = await axios.post('/api/posts', formData, config);

    dispatch({
      type: ADD_POST,
      payload: res.data,
    });

    dispatch(setAlert('Post Created', 'success'));
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};

//edit post
export const editPost = (text, postId) => async (dispatch) => {
  const config = {
    header: {
      'Content-Type': 'application/json',
    },
  };
  try {
    await axios.put(`/api/posts/${postId}`, text, config);

    dispatch({
      type: EDIT_POST,
      payload: { text: text.text, postId },
    });

    dispatch(setAlert('Post Edited', 'success'));
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};

//Get post by id
export const getPost = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/posts/${id}`);

    dispatch({
      type: GET_POST,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

//add comment
export const addComment = (postId, formData) => async (dispatch) => {
  const config = {
    header: {
      'content-type': 'application/json',
    },
  };
  try {
    const res = await axios.post(
      `/api/posts/${postId}/comment`,
      formData,
      config
    );

    dispatch({
      type: ADD_COMMENT,
      payload: res.data,
    });

    dispatch(setAlert('Comment Added', 'success'));
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};

//delete comment
export const deleteComment = (postId, commentId) => async (dispatch) => {
  console.log(postId, commentId);
  try {
    await axios.delete(`/api/posts/${postId}/comment/${commentId}`);

    dispatch({
      type: REMOVE_COMMENT,
      payload: commentId,
    });

    dispatch(setAlert('Comment Removed', 'success'));
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};

//edit comment
export const editComment = (text, postId, commentId) => async (dispatch) => {
  const config = {
    header: {
      'Content-Type': 'application/json',
    },
  };
  try {
    await axios.put(`/api/posts/${postId}/comment/${commentId}`, text, config);

    dispatch({
      type: EDIT_COMMENT,
      payload: { text: text.text, commentId },
    });

    dispatch(setAlert('Comment Edited', 'success'));
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status,
      },
    });
  }
};
