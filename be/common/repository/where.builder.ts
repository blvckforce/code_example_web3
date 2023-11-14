import * as _ from 'lodash';
import { Op } from 'sequelize';

export class WhereBuilder {
  protected where: Record<string | number | symbol, any> = {};

  constructor(where: any = {}) {
    this.where = where;
  }

  setSearch(value?: string, field = '') {
    if (value && field) {
      this._setField(
        field,
        {
          [Op.iLike]: `%${value}%`,
        },
      );
    }
    return this;
  }

  setIds(param?: number | number[], field = '') {
    if (param && field) {
      const ids = Array.isArray(param) ? param : [param];
      this._setField(
        field,
        {
          [Op.in]: ids,
        },
      );
    }
    return this;
  }

  private _setField(field: string, value) {
    if (this.where[field]) {
      const filter = this.where[field];
      delete this.where[field];

      if (this.where[Op.and]) {
        this.where[Op.and]?.push({ [field]: value });
      } else {
        _.set(this.where, Op.and, [{ [field]: filter }, { [field]: value }]);
      }
    } else {
      this.where[field] = value;
    }
  }

  setField(value?: any, field = '', isNot = false) {
    // TODO: add validation
    if (typeof value !== 'undefined' && field) {
      if (isNot) {
        this._setField(
          field,
          {
            [Op.ne]: value,
          },
        );

      } else {
        this._setField(
          field,
          value,
        );
      }
    }
    return this;
  }

  end() {
    return this.where;
  }
}
