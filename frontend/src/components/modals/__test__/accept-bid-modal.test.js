import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AcceptBidModal from '../AcceptBid';


const init = (props) => render(<AcceptBidModal  {...props} />);

describe('AcceptBidModal', function() {

  const defaultProps = {
    itemName: 'test item',
    bidderName: 'test bider',
    price: 20,
    currency: 'swapp',
  };

  let onClose;
  let onAccept;
  let onDeny;
  let props;

  beforeEach(() => {
    onClose = jest.fn();
    onAccept = jest.fn();
    onDeny = jest.fn();
    props = {
      visible: true,
      onClose,
      onAccept,
      info: defaultProps,
      onDeny,
    };
  });


  it('should be rendered properly', function() {
    const { asFragment } = init(props);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call onAccept when clicked "accept" button', async function() {
    init(props);

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await act(async () => {
      userEvent.click(acceptButton);
    });

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('should not call onDeny when clicked "accept" button', async function() {
    init(props);

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await act(async () => {
      userEvent.click(acceptButton);
    });
    expect(onDeny).not.toHaveBeenCalled();
  });

  it('should call onCancel when clicked "cancel" button', async function() {
    init(props);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      userEvent.click(cancelButton);
    });
    expect(onDeny).toHaveBeenCalledTimes(1);
  });

  it('should not call onAccept when clicked "cancel" button', async function() {
    init(props);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      userEvent.click(cancelButton);
    });
    expect(onAccept).not.toHaveBeenCalled();
  });
});
