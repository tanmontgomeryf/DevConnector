import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { withRouter, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { editEducation, getCurrentProfile } from '../../actions/profile';
import { setAlert } from '../../actions/alert';
const moment = require('moment');

const EditEducation = ({
  profile: { loading, profile },
  editEducation,
  getCurrentProfile,
  setAlert,
  history,
}) => {
  //set state
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    fieldofstudy: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });
  const [toDateDisabled, toggleDisabled] = useState();

  //destructure needs
  let { education_id } = useParams();
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  } = formData;

  const getEducationField = useCallback(() => {
    getCurrentProfile();

    if (!loading && profile) {
      const edu = profile.education.filter((edu) => edu._id === education_id);

      if (edu.length === 0) {
        history.push('/dashboard');
        setAlert('Invalid id', 'danger');
      } else {
        setFormData({
          school: edu[0].school,
          degree: edu[0].degree,
          fieldofstudy: edu[0].fieldofstudy,
          from: moment(edu[0].from).utc().format('YYYY-MM-DD'),
          to:
            edu[0].to === null
              ? ''
              : moment(edu[0].to).utc().format('YYYY-MM-DD'),
          current: edu[0].current,
          description: edu[0].description,
        });

        toggleDisabled(edu[0].current);
      }
    }
  }, [loading, history, getCurrentProfile, education_id, setAlert]);

  useEffect(() => {
    getEducationField();
  }, [getEducationField]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Fragment>
      <h1 className='large text-primary'>Add Your Education</h1>
      <p className='lead'>
        <i className='fas fa-code-branch'></i> Add any school or bootcamp that
        you attended
      </p>
      <small>* = required field</small>
      <form
        className='form'
        onSubmit={(e) => {
          e.preventDefault();
          editEducation(formData, history, education_id);
        }}
      >
        <div className='form-group'>
          <input
            type='text'
            placeholder='* School or Bootcamp'
            name='school'
            value={school}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            placeholder='* Degree or Certificate'
            name='degree'
            value={degree}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Field of Study'
            name='fieldofstudy'
            value={fieldofstudy}
            onChange={(e) => onChange(e)}
          />
        </div>
        <div className='form-group'>
          <h4>From Date</h4>
          <input
            type='date'
            name='from'
            value={from}
            onChange={(e) => onChange(e)}
          />
        </div>
        <div className='form-group'>
          <p>
            <input
              type='checkbox'
              name='current'
              checked={current}
              value={current}
              onChange={(e) => {
                setFormData({ ...formData, current: !current });
                toggleDisabled(!toDateDisabled);
              }}
            />{' '}
            Currently Studying
          </p>
        </div>
        <div className='form-group'>
          <h4>To Date</h4>
          <input
            type='date'
            name='to'
            value={to}
            onChange={(e) => onChange(e)}
            disabled={toDateDisabled ? 'disabled' : ''}
          />
        </div>
        <div className='form-group'>
          <textarea
            name='description'
            cols='30'
            rows='5'
            value={description}
            onChange={(e) => onChange(e)}
            placeholder='Program Description'
          ></textarea>
        </div>
        <input type='submit' className='btn btn-primary my-1' />
        <button
          type='button'
          className='btn btn-light my-1'
          onClick={() => history.goBack()}
        >
          Go Back
        </button>
      </form>
    </Fragment>
  );
};

EditEducation.propTypes = {
  editEducation: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  getCurrentProfile: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
});

export default connect(mapStateToProps, {
  editEducation,
  getCurrentProfile,
  setAlert,
})(withRouter(EditEducation));
