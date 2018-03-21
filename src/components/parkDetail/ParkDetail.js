import React, { Component } from 'react';
import { getParkById, loadReviews } from './actions';
import { connect } from 'react-redux';
import { getParkImage } from '../../services/googleAPI';
import { Link } from 'react-router-dom';
import ActionButton from '../actionButton/ActionButton';
import Reviews from './Reviews';
import ReactModal from 'react-modal';
import ReviewForm from './ReviewForm';
import { auth } from '../../services/firebase';
import './parkDetail.css';

export class ParkDetail extends Component {

  state = {
    open: false
  };

  customStyles = {
    content : {
      top: '20%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)'
    }
  };

  componentDidMount(){
    const { id } = this.props;
    this.props.getParkById(id);
    this.props.loadReviews(id);
  }

  componentWillMount() {
    ReactModal.setAppElement('body');
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  render() {
    
    if(!this.props.result) return null;
    
    const { name, formatted_address, international_phone_number, photos, opening_hours, url } = this.props.result;
    const { weekday_text } = opening_hours;
    const { open } = this.state;
    const { hasReviewed } = this.props;

    return (
      <div className="park-details">
        <figure className="splash-photo">
          <img id="park-detail-pic" src={getParkImage(photos[0].photo_reference, 500)} alt={name}/>
          <h2>{name}</h2>
          <p>{formatted_address}</p>
          <p>Rating (#reviews)</p>
        </figure>
        <div>
          <p>Phone: {international_phone_number}</p>
          <ul>Hours: { weekday_text.map((weekday, i) => <li key={i}>{weekday}</li>)}</ul>
          <Link to={url} target="_blank" rel="noopener noreferrer"><span className="fa fa-external-link"></span>Directions</Link>
        </div>
        <ul className="tag-list">
          <li>good</li>
          <li>bad</li>
        </ul>
        <div className="park-reviews">
          <h4>Reviews:</h4>
          <Reviews/>
        </div>
        {auth.currentUser && <ActionButton onClick={this.handleOpen} disabled={hasReviewed} type={'button'} buttonText={'Add Review'}/>}
        <ReactModal
          isOpen={open}
          style={this.customStyles}
          onRequestClose={this.handleClose}
        >
          <button onClick={this.handleClose}>x</button>
          <ReviewForm handleClose={this.handleClose}/>
        </ReactModal>
      </div>
    );
  }
}

const checkReviewed = (reviews) => {
  if(auth.currentUser) reviews.hasOwnProperty(auth.currentUser.uid);
  else return false;
};

export default connect(
  ({ currentPark, currentParkReviews }, { match }) => ({
    id: match.params.id,
    result: currentPark,
    reviews: currentParkReviews,
    hasReviewed: currentParkReviews && checkReviewed(currentParkReviews)
  }),
  ({ getParkById, loadReviews })
)(ParkDetail);