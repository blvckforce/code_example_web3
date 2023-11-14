import { act, renderHook } from '@testing-library/react-hooks';
import usePreventUnmount from '../usePreventUnmount';

describe('usePreventUnmount', function() {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  let setListener;
  let removeListener;


  beforeEach(() => {
    setListener = jest.fn();
    removeListener = jest.fn();
    window.addEventListener = jest.fn().mockImplementation((type, callback) => setListener(type, callback));
    window.removeEventListener = jest.fn().mockImplementation((type, callback) => removeListener(type, callback));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not add eventListener by default', function() {
    expect(window.addEventListener).not.toHaveBeenCalled();
    renderHook(usePreventUnmount);
    expect(setListener).not.toHaveBeenLastCalledWith('beforeunload', expect.any(Function));
  });

  it('should not remove eventListener by default', function() {
    expect(window.addEventListener).not.toHaveBeenCalled();
    renderHook(usePreventUnmount);
    expect(removeListener).not.toHaveBeenLastCalledWith('beforeunload', expect.any(Function));
  });

  it('should set event listener on call "enable" method and not remove listener', function() {
    expect(window.addEventListener).not.toHaveBeenCalled();
    const { result } = renderHook(usePreventUnmount);

    act(() => result.current.enablePreventUnmount());

    expect(setListener).toHaveBeenLastCalledWith('beforeunload', expect.any(Function));
  });

  xit('should remove eventListener on call "disable" method', function() {
    removeListener = jest.fn();
    expect(window.addEventListener).not.toHaveBeenCalled();
    const { result } = renderHook(usePreventUnmount);
    act(() => {
      result.current.enablePreventUnmount();
    });
    expect(removeListener).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));

    act(() => result.current.disablePreventUnmount());
    expect(removeListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));

  });

});
