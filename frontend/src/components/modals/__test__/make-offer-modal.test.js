import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MakeOfferModal from '../MakeOffer';

describe('MakeOfferModal', function() {

  let onOffer = jest.fn();
  let onClose = jest.fn();
  let currency = 'swapp';

  const init = () => render(
    <MakeOfferModal visible={true} onOffer={onOffer} currency={currency}
                    onClose={onClose} />,
  );


  it('should be rendered', function() {
    const { asFragment } = init();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should be change value by user', function() {
    const textValue = '123456';
    init();
    userEvent.type(screen.getByRole('spinbutton'), textValue);
    expect(screen.getByRole('spinbutton').value).toBe(textValue);
  });

  it('should call onClose method when user click the close button', function() {
    init();
    userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should reset input value on close', function() {
    const testString = '123';
    init();
    const priceInput = screen.getByRole('spinbutton', { name: /amount/i });
    userEvent.type(priceInput, testString);
    expect(priceInput.value).toBe(testString);
    userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(priceInput.value).toBe('');
  });

  xit('should call onOffer method when submit button was clicked', async function() {


    // TODO: refactor to a new params
    //  { amount: number,
    //    endDate: ....,
    //    currency: number,
    //  }
    const testString = '123';
    init();
    userEvent.type(screen.getByRole('spinbutton', { name: /amount/i }), testString);
    userEvent.click(screen.getByRole('button', { name: /make offer/i }));
    await waitFor(() => {
      expect(onOffer).toHaveBeenCalledTimes(1);
      expect(onOffer).toHaveBeenCalledWith(testString);
    });
  });

  xit('should change modal header while onOffer method runs', async function() {

    // TODO: refactor

    const testString = '123';
    init();
    userEvent.type(screen.getByRole('spinbutton', { name: /amount/i }), testString);

    const submitButton = screen.getByRole('button', { name: /make an offer/i });
    userEvent.click(submitButton);
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).not.toHaveTextContent(/make an offer/i);
    });

    await waitFor(() => expect(onOffer).toBeCalled());
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent(/make an offer/i);
  });

  xit('should close modal when onOffer method ends', async function() {
    const testString = '123';
    init();
    userEvent.type(screen.getByRole('spinbutton', { name: /amount/i }), testString);

    const submitButton = screen.getByRole('button', { name: /make offer/i });
    userEvent.click(submitButton);

    await waitFor(() => expect(onOffer).toBeCalled());
    expect(submitButton).not.toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
