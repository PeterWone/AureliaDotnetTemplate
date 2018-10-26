import * as moment from 'moment';
export class DatetimeValueConverter {
  public toView(value: Date, formatString = "YYYY-MM-DD LT") {
    return moment(value).format(formatString)
  }
}