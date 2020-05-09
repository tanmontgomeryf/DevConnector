import React, { Fragment, useState, useEffect } from 'react';
import { Link, withRouter, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { editExperience, getCurrentProfile } from '../../actions/profile';
import { setAlert } from '../../actions/alert';
const moment = require('moment');

const EditExperience = ({
  profile: { loading, profile },
  editExperience,
  getCurrentProfile,
  setAlert,
  history,
}) => {
  //set state
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    location: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });
  const [toDateDisabled, toggleDisabled] = useState();

  //destructure needs
  let { experience_id } = useParams();
  const { company, title, location, from, to, current, description } = formData;

  useEffect(() => {
    getCurrentProfile();

    if (!loading && profile) {
      const exp = profile.experience.filter((exp) => exp._id === experience_id);

      if (exp.length === 0) {
        history.push('/dashboard');
        setAlert('Invalid id', 'danger');
      } else {
        setFormData({
          company: exp[0].company,
          title: exp[0].title,
          location: exp[0].location,
          from: moment(exp[0].from).utc().format('YYYY-MM-DD'),
          to:
            exp[0].to === null
              ? ''
              : moment(exp[0].to).utc().format('YYYY-MM-DD'),
          current: exp[0].current,
          description: exp[0].description,
        });

        toggleDisabled(exp[0].current);
      }
    }
  }, [loading, experience_id, getCurrentProfile, history, setAlert]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Fragment>
      <h1 className='large text-primary'>Add An Experience</h1>
      <p className='lead'>
        <i className='fas fa-code-branch'></i> Add any developer/programming
        positions that you have had in the past
      </p>
      <small>* = required field</small>
      <form
        className='form'
        onSubmit={(e) => {
          e.preventDefault();
          editExperience(formData, history, experience_id);
        }}
      >
        <div className='form-group'>
          <input
            type='text'
            placeholder='* Job Title'
            name='title'
            value={title}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            placeholder='* Company'
            name='company'
            value={company}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Location'
            name='location'
            value={location}
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
            Current Job
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
            placeholder='Job Description'
          ></textarea>
        </div>
        <input type='submit' className='btn btn-primary my-1' />
        <Link className='btn btn-light my-1' to='/dashboard'>
          Go Back
        </Link>
      </form>
    </Fragment>
  );
};

EditExperience.propTypes = {
  editExperience: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  getCurrentProfile: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
});

export default connect(mapStateToProps, {
  editExperience,
  getCurrentProfile,
  setAlert,
})(withRouter(EditExperience));
