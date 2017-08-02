import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import moment from 'moment';
import 'moment-range';

type DatesType = {
  customStyle?: ?StyleSheet,
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  blockRangeWhenBlockedDateInPeriod?: boolean,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void
}

type MonthType = {
  customStyle?: ?StyleSheet,
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  currentDate: moment,
  focusedMonth: moment,
  blockRangeWhenBlockedDateInPeriod?: boolean,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void
}

type WeekType = {
  style?: StyleSheet,
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  startOfWeek: moment,
  blockRangeWhenBlockedDateInPeriod?: boolean,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  week: {
    flexDirection: 'row'
  },
  dayName: {
    flexGrow: 1,
    flexBasis: 1,
    textAlign: 'center',
  },
  day: {
    flexGrow: 1,
    flexBasis: 1,
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    margin: 1,
    padding: 10
  },
  dayBlocked: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  daySelected: {
    backgroundColor: 'rgb(52,120,246)'
  },
  dayText: {
    color: 'rgb(0, 0, 0)',
    fontWeight: '600'
  },
  dayDisabledText: {
    color: 'gray',
    opacity: 0.5,
    fontWeight: '400'
  },
  daySelectedText: {
    color: 'rgb(252, 252, 252)'
  }
});

const dates = (startDate: ?moment, endDate: ?moment, focusedInput: 'startDate' | 'endDate') => {
  if (focusedInput === 'startDate') {
    if (startDate && endDate) {
      return ({ startDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'endDate' });
  }

  if (focusedInput === 'endDate') {
    if (endDate && startDate && endDate.isBefore(startDate)) {
      return ({ startDate: endDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'startDate' });
  }

  return ({ startDate, endDate, focusedInput });
};

export const Week = (props: WeekType) => {
  const {
    customStyle,
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    startOfWeek,
    blockRangeWhenBlockedDateInPeriod,
    onDatesChange,
    isDateBlocked,
    onDisableClicked
  } = props;

  const days = [];
  const endOfWeek = startOfWeek.clone().endOf('isoweek');

  moment.range(startOfWeek, endOfWeek).by('days', (day: moment) => {
    const onPress = () => {
      if (isDateBlocked(day)) {
        onDisableClicked(day);
      } else if (range) {
        let isPeriodBlocked = false;
        const start = focusedInput === 'startDate' ? day : startDate;
        const end = focusedInput === 'endDate' ? day : endDate;
        if (start && end && blockRangeWhenBlockedDateInPeriod) {
          moment.range(start, end).by('days', (dayPeriod: moment) => {
            if (isDateBlocked(dayPeriod)) isPeriodBlocked = true;
          });
        }
        onDatesChange(isPeriodBlocked ?
          dates(end, null, 'startDate') :
          dates(start, end, focusedInput));
      } else {
        onDatesChange({ date: day });
      }
    };

    const isDateSelected = () => {
      if (range) {
        if (startDate && endDate) {
          return day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate);
        }
        return (startDate && day.isSame(startDate)) || (endDate && day.isSame(endDate));
      }
      return date && day.isSame(date);
    };

    const isBlocked = isDateBlocked(day);
    const isSelected = isDateSelected();

    const dayBlockedStyle = (customStyle && customStyle.dayBlocked) ? customStyle.dayBlocked : styles.dayBlocked;
    const daySelectedStyle = (customStyle && customStyle.daySelected) ? customStyle.daySelected : styles.daySelected;
    const dayDisabledTextStyle = (customStyle && customStyle.dayDisabledText) ? customStyle.dayDisabledText : styles.dayDisabledText;
    const daySelectedTextStyle = (customStyle && customStyle.daySelectedText) ? customStyle.daySelectedText : styles.daySelectedText;

    const style = [
      styles.day,
      customStyle && customStyle.day,
      isBlocked && dayBlockedStyle,
      isSelected && daySelectedStyle
    ];

    const styleText = [
      styles.dayText,
      customStyle && customStyle.dayText,
      isBlocked && dayDisabledTextStyle,
      isSelected && daySelectedTextStyle
    ];

    days.push(
      <TouchableOpacity
        key={day.date()}
        style={style}
        onPress={onPress}
        disabled={isBlocked && !onDisableClicked}
      >
        <Text style={styleText}>{day.date()}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={[styles.week, customStyle && customStyle.week]}>{days}</View>
  );
};

export const Month = (props: MonthType) => {
  const {
    customStyle,
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    currentDate,
    focusedMonth,
    blockRangeWhenBlockedDateInPeriod,
    onDatesChange,
    isDateBlocked,
    onDisableClicked
  } = props;

  const dayNames = [];
  const weeks = [];
  const startOfMonth = focusedMonth.clone().startOf('month').startOf('isoweek');
  const endOfMonth = focusedMonth.clone().endOf('month');
  const weekRange = moment.range(currentDate.clone().startOf('isoweek'), currentDate.clone().endOf('isoweek'));

  weekRange.by('days', (day: moment) => {
    dayNames.push(
      <Text key={day.date()} style={[styles.dayName, customStyle && customStyle.dayName]}>
        {day.format('dd')}
      </Text>
    );
  });

  moment.range(startOfMonth, endOfMonth).by('weeks', (week: moment) => {
    weeks.push(
      <Week
        customStyle={customStyle}
        key={week}
        range={range}
        date={date}
        startDate={startDate}
        endDate={endDate}
        focusedInput={focusedInput}
        currentDate={currentDate}
        focusedMonth={focusedMonth}
        startOfWeek={week}
        blockRangeWhenBlockedDateInPeriod={blockRangeWhenBlockedDateInPeriod}
        onDatesChange={onDatesChange}
        isDateBlocked={isDateBlocked}
        onDisableClicked={onDisableClicked}
      />
    );
  });

  return (
    <View style={[styles.month, customStyle && customStyle.month]}>
      <View style={[styles.week, customStyle && customStyle.week]}>
        {dayNames}
      </View>
      {weeks}
    </View>
  );
};

export default class Dates extends Component {
  state = {
    currentDate: moment(),
    focusedMonth: moment().startOf('month')
  }
  props: DatesType;

  render() {
    const previousMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(-1, 'M') });
    };

    const nextMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(1, 'M') });
    };

    return (
      <View style={styles.calendar}>
        <View style={styles.heading}>
          <TouchableOpacity onPress={previousMonth}>
            <Text>{'< Previous'}</Text>
          </TouchableOpacity>
          <Text>{this.state.focusedMonth.format('MMMM')}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <Text>{'Next >'}</Text>
          </TouchableOpacity>
        </View>
        <Month
          range={this.props.range}
          date={this.props.date}
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          focusedInput={this.props.focusedInput}
          currentDate={this.state.currentDate}
          focusedMonth={this.state.focusedMonth}
          blockRangeWhenBlockedDateInPeriod={this.props.blockRangeWhenBlockedDateInPeriod}
          onDatesChange={this.props.onDatesChange}
          isDateBlocked={this.props.isDateBlocked}
          onDisableClicked={this.props.onDisableClicked}
        />
      </View>
    );
  }
}
