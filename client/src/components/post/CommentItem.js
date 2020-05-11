import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { deleteComment, editComment } from '../../actions/post';

const CommentItem = ({
  postId,
  comment: { _id, text, name, avatar, user, date },
  auth,
  deleteComment,
  editComment,
}) => {
  const [editForm, toggleEditForm] = useState(false);
  const [editText, setEditText] = useState(text);
  return (
    <div className='comments'>
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
                editComment({ text: editText }, postId, _id);
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
                onClick={(e) => deleteComment(postId, _id)}
                type='button'
                className='btn btn-danger'
              >
                <i className='fas fa-times'></i>
              </button>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

CommentItem.propTypes = {
  postId: PropTypes.string.isRequired,
  comment: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
  editComment: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { deleteComment, editComment })(
  CommentItem
);
