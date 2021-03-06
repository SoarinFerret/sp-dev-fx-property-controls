import * as React from 'react';
import styles from '../PropertyFieldCollectionDataHost.module.scss';
import { ICollectionDataItemProps, ICollectionDataItemState } from '.';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';
import { Link } from 'office-ui-fabric-react/lib/components/Link';
import { Checkbox } from 'office-ui-fabric-react/lib/components/Checkbox';
import * as strings from 'PropertyControlStrings';
import { ICustomCollectionField, CustomCollectionFieldType } from '..';
import { Dropdown } from 'office-ui-fabric-react';

export class CollectionDataItem extends React.Component<ICollectionDataItemProps, ICollectionDataItemState> {
  private emptyItem: any = null;

  constructor(props: ICollectionDataItemProps) {
    super(props);

    // Create an empty item with all properties
    this.emptyItem = {};
    for (const field of this.props.fields) {
      this.emptyItem[field.id] = null;
    }

    this.state = {
      crntItem: this.props.item || {...this.emptyItem}
    };
  }

  /**
   * componentDidUpdate lifecycle hook
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: ICollectionDataItemProps, prevState: ICollectionDataItemState): void {
    if (this.props.item !== prevProps.item) {
      this.setState({
        crntItem: this.props.item
      });
    }
  }

  /**
   * Update the item value on the field change
   */
  private onValueChanged = (fieldId: string, value: any): void => {
    this.setState((prevState: ICollectionDataItemState): ICollectionDataItemState => {
      const { crntItem } = prevState;
      // Update the changed field
      crntItem[fieldId] = value;

      // Check if current item is valid
      if (this.props.fAddInCreation) {
        if (this.checkAllRequiredFieldsValid(crntItem) && this.checkAnyFieldContainsValue(crntItem)) {
          this.props.fAddInCreation(crntItem);
        } else {
          this.props.fAddInCreation(null);
        }
      }

      // Store this in the current state
      return { crntItem };
    });
  }

  /**
   * Check if all values of the required fields are provided
   */
  private checkAllRequiredFieldsValid(item: any): boolean {
    // Get all the required fields
    const requiredFields = this.props.fields.filter(f => f.required);
    // Check all the required field values
    for (const field of requiredFields) {
      if (typeof item[field.id] === "undefined" || item[field.id] === null || item[field.id] === "") {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if any of the fields contain a value
   * @param item
   */
  private checkAnyFieldContainsValue(item: any): boolean {
    const { fields } = this.props;
    for (const field of fields) {
      if (typeof item[field.id] !== "undefined" && item[field.id] !== null && item[field.id] !== "") {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the add action needs to be disabled
   */
  private disableAdd(item: any) {
    return !this.checkAllRequiredFieldsValid(item) || !this.checkAnyFieldContainsValue(item) || !this.props.fAddItem;
  }

  /**
   * Add the current row to the collection
   */
  private addRow = () => {
    if (this.props.fAddItem) {
      const { crntItem } = this.state;
      // Check if all the fields are correctly provided
      if (this.checkAllRequiredFieldsValid(crntItem) && this.checkAnyFieldContainsValue(crntItem)) {
        this.props.fAddItem(crntItem);
        // Clear all field values
        this.setState({
          crntItem: {...this.emptyItem}
        });
      }
    }
  }

  /**
   * Add the current row to the collection
   */
  private updateItem = () => {
    if (this.props.fUpdateItem) {
      const { crntItem } = this.state;
      // Check if all the fields are correctly provided
      if (this.checkAllRequiredFieldsValid(crntItem) && this.checkAnyFieldContainsValue(crntItem)) {
        this.props.fUpdateItem(this.props.index, crntItem);
      }
    }
  }

  /**
   * Delete the item from the collection
   */
  private deleteRow = () => {
    if (this.props.fdeleteItem) {
      this.props.fdeleteItem(this.props.index);
    }
  }

  /**
   * Render the field
   * @param field
   * @param item
   */
  private renderField(field: ICustomCollectionField, item: any) {
    switch(field.type) {
      case CustomCollectionFieldType.boolean:
        return <Checkbox checked={item[field.id] ? item[field.id] : false}
                         onChange={(ev, value) => this.onValueChanged(field.id, value)} />;
      case CustomCollectionFieldType.dropdown:
        return <Dropdown placeHolder={field.title}
                         options={field.options}
                         selectedKey={item[field.id] || null}
                         required={field.required}
                         onChanged={(opt) => this.onValueChanged(field.id, opt.key)} />;
      case CustomCollectionFieldType.number:
        return (
          <div className={styles.numberField}>
            <input type="number"
                   role="spinbutton"
                   placeholder={field.title}
                   aria-valuemax="99999"
                   aria-valuemin="-999999"
                   aria-valuenow={item[field.id] || ''}
                   value={item[field.id] || ''}
                   onChange={(ev) => this.onValueChanged(field.id, ev.target.value)} />
          </div>
        );
      case CustomCollectionFieldType.string:
      default:
        return <TextField placeholder={field.title}
                          value={item[field.id] ? item[field.id] : ""}
                          required={field.required}
                          onChanged={(value) => this.onValueChanged(field.id, value)} />;
    }
  }

  /**
   * Default React render
   */
  public render(): React.ReactElement<ICollectionDataItemProps> {
    const { crntItem } = this.state;

    return (
      <div className={`${styles.tableRow} ${this.props.index === null ? styles.tableFooter : ""}`}>
        {
          this.props.fields.map(f => (
            <span className={`${styles.tableCell} ${styles.inputField}`}>{this.renderField(f, crntItem)}</span>
          ))
        }

        <span className={styles.tableCell}>
        {
          /* Check add or delete action */
          this.props.index !== null ? (
            <Link title={strings.CollectionDeleteRowButtonLabel} disabled={!this.props.fdeleteItem} onClick={this.deleteRow}>
              <Icon iconName="Clear" />
            </Link>
          ) : (
            <Link title={strings.CollectionAddRowButtonLabel} className={`${this.disableAdd(crntItem) ? "" : styles.addBtn}`} disabled={this.disableAdd(crntItem)} onClick={this.addRow}>
              <Icon iconName="Add" />
            </Link>
          )
        }
        </span>
      </div>
    );
  }
}
