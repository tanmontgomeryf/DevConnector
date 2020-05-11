import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { addLike, removeLike, deletePost, editPost } from '../../actions/post';

const PostItem = ({
  auth,
  post: { _id, text, name, avatar, user, likes, comments, date },
  addLike,
  removeLike,
  deletePost,
  editPost,
  showActions,
}) => {
  const [editForm, toggleEditForm] = useState(false);
  const [editText, setEditText] = useState(text);
  return (
    <div className='post bg-white p-1 my-1'>
      <div>
        <Link to={`/profile/${user}`}>
          <img className='round-img' src={avatar} alt='' />
          <h4>{name}</h4>
        </Link>
      </div>
      <div>
        {editForm ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editPost({ text: editText }, _id);
              toggleEditForm(!editForm);
            }}
          >
            <input
              className='edit-Text'
              type='text'
              name='editText'
              cols='100'
              rows='3'
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              required
            />
          </form>
        ) : (
          <p className='my-1'>{text}</p>
        )}

        <p className='post-date'>
          Posted on <Moment format='YYYY/MM/DD'>{date}</Moment>
        </p>

        {showActions && (
          <Fragment>
            <button
              onClick={(e) => addLike(_id)}
              type='button'
              className='btn btn-light'
            >
              <i className='fas fa-thumbs-up'></i>{' '}
              {likes.length > 0 && <span>{likes.length}</span>}
            </button>
            <button
              onClick={(e) => removeLike(_id)}
              type='button'
              className='btn btn-light'
            >
              <i className='fas fa-thumbs-down'></i>
            </button>
            <Link to={`/posts/${_id}`} className='btn btn-primary'>
              Discussion{' '}
              {comments.length > 0 && (
                <span className='comment-count'>{comments.length}</span>
              )}
            </Link>
            {!auth.loading && user === auth.user._id && (
              <Fragment>
                <button
                  onClick={() => {
                    setEditText(text);
                    toggleEditForm(!editForm);
                  }}
                  type='button'
                  className='btn btn-primary'
                >
                  <i className='fas fa-edit'></i>
                </button>
                <button
                  onClick={(e) => deletePost(_id)}
                  type='button'
                  className='btn btn-danger'
                >
                  <i className='fas fa-times'></i>
                </button>
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

PostItem.defaultProps = {
  showActions: true,
};

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  editPost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ auth: state.auth });

export default connect(mapStateToProps, {
  addLike,
  removeLike,
  deletePost,
  editPost,
})(PostItem);
