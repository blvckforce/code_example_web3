import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COLLECTION_PARAMS } from '../../../../config/API_ROUTES';
import { LocalAccordion } from '../Properties';

describe('Properties Filter', function() {

  let showFilter = jest.fn();
  let onItemClick = jest.fn();
  const defaultName = 'test name';

  let properties = [];
  beforeEach(() => {
    properties = [{ value: 'test1', count: 1 }, { value: 'test2', count: 2 }, { value: 'test3', count: 3 }];
  });

  const init = ({ title, properties, accordion, selectedItems } = {}) => render(
    <LocalAccordion name={title ?? defaultName}
                    accordion={accordion ?? {}}
                    properties={properties ?? []}
                    showFilter={showFilter}
                    onItemClick={onItemClick}
                    selectedItems={selectedItems ?? {}}
    />);

  it('should be not rendered if properties is an empty Array', function() {
    const { container } = init({ properties: [] });
    expect(container.children).toHaveLength(0);
  });

  it(`should have ${properties.length} children checkbox`, function() {
    init({ properties });
    expect(screen.getAllByRole('checkbox')).toHaveLength(properties.length);
  });

  it('should show items count according to properties length', function() {

    init({ properties });
    const defaultRegEx = new RegExp(defaultName, 'i');

    const propertyLengthEl = screen.queryByText(defaultRegEx).nextElementSibling;
    expect(propertyLengthEl).toHaveTextContent(properties.length.toString());
  });


  it('should filter one element when Filter input text was changed', async function() {
    init({ properties });

    userEvent.type(screen.getByRole('textbox', { name: /filter/i }), properties[0].value);

    // debounsed search
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    });

    expect(screen.getByRole('checkbox', { name: new RegExp(`${properties[0].value} items quantity`) })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: new RegExp(`${properties[1].value} items quantity`) })).not.toBeInTheDocument();
  });

  it('checkboxes should not be checked by default', function() {
    init({ properties });

    const checkboxes = screen.getAllByRole('checkbox', { name: /|w/ });

    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });


  it('should be called onItem with right params if checkbox was clicked once', function() {
    init({ properties });

    const checkbox = screen.getByRole('checkbox', { name: new RegExp(properties[1].value) });
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(onItemClick).toBeCalledWith(properties[1].value, { label: properties[1].value, parent: defaultName });
  });

  it('should be checked only checkbox what checked in props', function() {
    init({
      properties, selectedItems: {
        [properties[1].value]: properties[1].value,
      },
    });

    const allCheckboxes = screen.getAllByRole('checkbox', { name: new RegExp(`^((?!${properties[1].value}).)*$`) });

    const checkbox = screen.getByRole('checkbox', { name: new RegExp(properties[1].value) });

    allCheckboxes.forEach((item) => {
      expect(item).not.toBeChecked();
    });
    expect(checkbox).toBeChecked();
  });
});
