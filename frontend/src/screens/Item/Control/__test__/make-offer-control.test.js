import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockItem } from '../../../../mocks/test-mocks';
import MakeOfferControls from '../bodies/MakeOfferControls';

describe('MakeOfferControls', function() {

  let updateItem;
  let owner;

  beforeEach(() => {
    updateItem = jest.fn();
  });

  describe('owner part', function() {

    beforeEach(() => {
      owner = true;
    });

    it('should be rendered properly for owner', function() {
      const { asFragment } = render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('should not call update item method when "put on sale" was not clicked', function() {
      render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
      expect(updateItem).not.toHaveBeenCalled();
    });

    it('should not call update item method when "put on sale" button was clicked', function() {
      render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
      userEvent.click(screen.getByRole('button'));
      expect(updateItem).not.toHaveBeenCalled();
    });

    it('should not be opened "Put on sale" modal when "put on sale" button was not clicked', function() {
      render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should open "Put on sale" modal when "put on sale" button was clicked', function() {
      render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
      userEvent.click(screen.getByRole('button'));

      const modalHeading = screen.getByRole('heading');
      expect(modalHeading).toBeInTheDocument();
      expect(modalHeading).toHaveTextContent(/put on sale/i)
    });
  });
});

describe('user section', function() {
  const updateItem = jest.fn()
  const  owner = false;

  it('should be rendered properly for user', function() {
    const { asFragment } = render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should Make offer modal be opened when "make an offer" button was clicked', function() {
    render(<MakeOfferControls item={mockItem} owner={owner} updateItem={updateItem} />);
    userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent(/make an offer/i);
  });


});
