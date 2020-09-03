import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const ProfileEducation = ({
  education: { school, degree, fieldofstudy, current, to, from, description }
}) => (
  <div>
    {' '}
    <h3 className='text-dark'>{school}</h3>{' '}
    <p>
      {' '}
      {moment(from).format('MM/DD/YYYY')} -{' '}
      {!to ? ' Now' : moment(to).format('MM/DD/YYYY')}
    </p>
    <p>
      <strong>Position:</strong> {degree}
    </p>
    <p>
      <strong>Field Of Study:</strong> {fieldofstudy}
    </p>
    <p>
      <strong>Description:</strong> {description}
    </p>
  </div>
);
ProfileEducation.propTypes = {
  education: PropTypes.array.isRequired
};

export default ProfileEducation;
