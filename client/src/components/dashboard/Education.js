import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

const Education = ({ education }) => {
  const educations = education.map((edu) => {
    return (
      <tr key={edu._id}>
        <td> {edu.school}</td>
        <td className='hide-sm'> {edu.fieldofstudy} </td>
        <td className='hide-sm'> {edu.degree} </td>
        <td>
          <span> {moment(edu.from).format('MM/DD/YYYY')} </span> -{' '}
          {edu.to === null ? (
            ' Now'
          ) : (
            <span> {moment(edu.to).format('MM/DD/YYYY')} </span>
          )}
        </td>
        <td>
          <button className='btn btn-danger'> Delete </button>
        </td>
      </tr>
    );
  });
  return (
    <Fragment>
      <h2 className='my-2'>Education Credentials</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>School </th>
            <th className='hide-sm'>Field of Study</th>
            <th className='hide-sm'>Degree</th>
            <th className='hide-sm'>Years</th>
            <th />
          </tr>
        </thead>
        <tbody>{educations}</tbody>
      </table>
    </Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired
};

export default connect()(Education);
