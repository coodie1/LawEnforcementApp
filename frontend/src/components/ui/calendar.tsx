"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, useDayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format, eachMonthOfInterval, startOfYear, endOfYear, eachYearOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  maxDate?: Date;
  minDate?: Date;
  disableFutureNavigation?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  maxDate,
  minDate,
  disableFutureNavigation,
  ...props
}: CalendarProps) {
  const [view, setView] = React.useState<"day" | "month" | "year">("day");
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mx-10 mb-1 -mt-1 flex h-9 items-center justify-center z-20",
    caption_label: "text-sm font-medium cursor-pointer hover:text-primary transition-colors",
    nav: "absolute top-0 flex w-full justify-between z-10",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-muted-foreground/80 hover:text-primary-foreground p-0 rounded-xl transition-all duration-200 hover:bg-primary hover:shadow-sm",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-muted-foreground/80 hover:text-primary-foreground p-0 rounded-xl transition-all duration-200 hover:bg-primary hover:shadow-sm",
    ),
    weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    day_button:
      "relative flex size-9 items-center justify-center whitespace-nowrap rounded-xl p-0 text-foreground outline-offset-2 transition-all duration-200 ease-in-out group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-200 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-primary hover:shadow-sm hover:text-primary-foreground group-data-[selected]:bg-primary group-data-[selected]:shadow-md group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:opacity-40 group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground group-data-[outside]:hover:bg-primary group-data-[outside]:hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:shadow-md group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground",
    day: "group size-9 px-0 text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary *:after:transition-all *:after:duration-200 [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  );

  // Handle month navigation restriction
  const handleMonthChange = (date: Date) => {
    // Prevent navigation to dates before minDate
    if (minDate) {
      const minDateMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      if (dateMonth < minDateMonth) {
        // Prevent navigation to dates before minDate
        return;
      }
    }
    
    // Prevent navigation beyond maxDate (if set)
    if (maxDate) {
      const maxDateMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      if (dateMonth > maxDateMonth) {
        // Prevent navigation beyond maxDate
        return;
      }
    }
    
    // Check for future navigation only if disableFutureNavigation is true and maxDate is not set
    if (disableFutureNavigation && !maxDate) {
      const today = new Date();
      if (date.getFullYear() > today.getFullYear() || 
          (date.getFullYear() === today.getFullYear() && date.getMonth() > today.getMonth())) {
        // Prevent navigation to future months - don't call the original handler
        return;
      }
    }
    
    if (props.onMonthChange) {
      props.onMonthChange(date);
    }
  };

  // Use a ref to track if we're updating from internal selection vs external prop change
  const isInternalUpdate = React.useRef(false);

  // Custom navigation component that disables forward button when at max date
  const CustomChevron = (props: any) => {
    const context = useDayPicker();
    const { orientation, onClick, ...restProps } = props;
    
    // Create a handler that updates our internal state AND calls the original onClick
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Update our internal state based on orientation
      const currentDate = new Date(selectedYear, selectedMonth, 1);
      let newDate: Date;
      
      if (orientation === "left") {
        // Previous month
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      } else {
        // Next month
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }
      
      // Check if navigation would go beyond maxDate (if set)
      if (maxDate) {
        const maxDateMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        if (newDate.getFullYear() > maxDateMonth.getFullYear() || 
            (newDate.getFullYear() === maxDateMonth.getFullYear() && newDate.getMonth() > maxDateMonth.getMonth())) {
          return; // Prevent navigation beyond maxDate
        }
      }
      
      // Check if navigation would go before minDate (if set)
      if (minDate) {
        const minDateMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        if (newDate.getFullYear() < minDateMonth.getFullYear() || 
            (newDate.getFullYear() === minDateMonth.getFullYear() && newDate.getMonth() < minDateMonth.getMonth())) {
          return; // Prevent navigation before minDate
        }
      }
      
      // Check if navigation is allowed (for disableFutureNavigation with actual today)
      if (disableFutureNavigation && !maxDate) {
        const today = new Date();
        if (newDate.getFullYear() > today.getFullYear() || 
            (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() > today.getMonth())) {
          return; // Prevent navigation to future months
        }
      }
      
      // Mark as internal update
      isInternalUpdate.current = true;
      
      // Update state
      setSelectedYear(newDate.getFullYear());
      setSelectedMonth(newDate.getMonth());
      
      // Trigger month change handler
      handleMonthChange(newDate);
      
      // Call the original onClick if provided (for react-day-picker's internal handling)
      if (onClick) {
        onClick(e);
      }
    };
    
    // Left arrow (previous month)
    if (orientation === "left") {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "size-9 text-muted-foreground/80 hover:text-primary-foreground p-0 rounded-xl transition-all duration-200 hover:bg-primary hover:shadow-sm"
          )}
          {...restProps}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      );
    }
    
    // Right arrow (forward navigation) - disable if at maxDate
    if (maxDate) {
      const context = useDayPicker();
      const displayMonth = (context as any).month || (context as any).displayMonth || new Date(selectedYear, selectedMonth, 1);
      const maxDateMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const displayMonthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
      
      const isAtMaxMonth = displayMonthStart.getFullYear() === maxDateMonth.getFullYear() && 
                          displayMonthStart.getMonth() === maxDateMonth.getMonth();
      
      if (isAtMaxMonth) {
        return (
          <button
            type="button"
            disabled
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "size-9 text-muted-foreground/30 p-0 rounded-xl cursor-not-allowed opacity-50"
            )}
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
            {...restProps}
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        );
      }
    } else if (disableFutureNavigation) {
      // Only check for future navigation if maxDate is not set
      const context = useDayPicker();
      const today = new Date();
      const displayMonth = (context as any).month || (context as any).displayMonth || new Date(selectedYear, selectedMonth, 1);
      const displayMonthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
      const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const isAtMaxMonth = displayMonthStart.getFullYear() === todayMonth.getFullYear() && 
                          displayMonthStart.getMonth() === todayMonth.getMonth();
      
      if (isAtMaxMonth) {
        return (
          <button
            type="button"
            disabled
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "size-9 text-muted-foreground/30 p-0 rounded-xl cursor-not-allowed opacity-50"
            )}
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
            {...restProps}
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        );
      }
    }
    
    // Right arrow (normal navigation)
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 text-muted-foreground/80 hover:text-primary-foreground p-0 rounded-xl transition-all duration-200 hover:bg-primary hover:shadow-sm"
        )}
        {...restProps}
      >
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    );
  };

  // Custom Caption component - we'll let react-day-picker handle the structure, just override the label
  // Remove CustomCaption to let the default structure work, and only override CaptionLabel

  // Custom CaptionLabel to replace the default label - this is what displays the month/year text
  const CustomCaptionLabel = React.useCallback((labelProps: any) => {
    const context = useDayPicker();
    const displayMonth = (context as any).month || (context as any).displayMonth || new Date(selectedYear, selectedMonth, 1);
    const currentYear = displayMonth.getFullYear();

    const handleMonthClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedYear(currentYear);
      setView("month");
    };

    const handleYearClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedYear(currentYear);
      setView("year");
    };

    // Return a div with two separate clickable buttons - event delegation will also handle these
    return (
      <div className="flex items-center justify-center gap-2" {...labelProps}>
        <button
          type="button"
          onClick={handleMonthClick}
          className="text-sm font-medium cursor-pointer text-foreground transition-colors px-2 py-1 rounded-md hover:text-primary hover:bg-muted"
          data-caption-part="month"
        >
          {format(displayMonth, "MMMM")}
        </button>
        <button
          type="button"
          onClick={handleYearClick}
          className="text-sm font-medium cursor-pointer text-foreground transition-colors px-2 py-1 rounded-md hover:text-primary hover:bg-muted"
          data-caption-part="year"
        >
          {currentYear}
        </button>
      </div>
    );
  }, [selectedYear, selectedMonth]);

  // Month View Component (3x4 grid)
  const MonthView = () => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 11, 31)),
    });

    const handleMonthSelect = (month: Date) => {
      const newYear = month.getFullYear();
      const newMonth = month.getMonth();
      
      // Mark as internal update to prevent useEffect from resetting
      isInternalUpdate.current = true;
      
      // Update state first
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
      
      // Then change view and notify parent
      setView("day");
      
      // Notify parent component of the month change
      if (props.onMonthChange) {
        props.onMonthChange(month);
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("year")}
            className="h-8 text-sm"
          >
            <ChevronLeft size={14} className="mr-1" />
            {selectedYear}
          </Button>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-3 gap-2 p-2 min-w-[280px]"
        >
          {months.map((month) => (
            <Button
              key={month.toISOString()}
              variant={month.getMonth() === selectedMonth ? "default" : "outline"}
              size="sm"
              className="h-14 flex flex-col rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
              onClick={() => handleMonthSelect(month)}
            >
              <span className="text-sm font-medium">{format(month, "MMM")}</span>
            </Button>
          ))}
        </motion.div>
      </div>
    );
  };

  // Year/Decade View Component
  const YearView = () => {
    const startDecade = Math.floor(selectedYear / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startDecade - 1 + i);

    const handleYearSelect = (year: number) => {
      // Mark as internal update to prevent useEffect from resetting
      isInternalUpdate.current = true;
      
      setSelectedYear(year);
      // Keep the current selected month when changing year, or default to January
      if (selectedMonth === undefined || selectedMonth < 0 || selectedMonth > 11) {
        setSelectedMonth(0); // Default to January
      }
      setView("month");
    };

    const handleDecadeNavigation = (direction: "prev" | "next") => {
      const newDecade = direction === "prev" ? startDecade - 12 : startDecade + 12;
      setSelectedYear(newDecade);
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="p-2 min-w-[280px]"
      >
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDecadeNavigation("prev")}
            className="h-8"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-medium">
            {startDecade} - {startDecade + 11}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDecadeNavigation("next")}
            className="h-8"
            disabled={disableFutureNavigation && maxDate && startDecade + 11 >= (maxDate.getFullYear())}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => {
            const isDisabled = disableFutureNavigation && maxDate && year > maxDate.getFullYear();
            return (
              <Button
                key={year}
                variant={year === selectedYear ? "default" : "outline"}
                size="sm"
                className="h-12 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
                onClick={() => !isDisabled && handleYearSelect(year)}
                disabled={isDisabled}
              >
                {year}
              </Button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const defaultComponents = {
    Chevron: CustomChevron,
    CaptionLabel: CustomCaptionLabel,
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  // Handle date selection - navigate to month if clicking on outside dates
  const handleSelect = (selected: any) => {
    // Handle different modes: single, multiple, range
    let dateToCheck: Date | undefined;
    
    if (selected instanceof Date) {
      // Single mode
      dateToCheck = selected;
    } else if (Array.isArray(selected) && selected.length > 0) {
      // Multiple mode - check the first selected date
      dateToCheck = selected[0];
    } else if (selected && typeof selected === 'object' && 'from' in selected) {
      // Range mode - check the 'from' date if available, otherwise 'to'
      dateToCheck = selected.from || selected.to;
    }
    
    if (dateToCheck) {
      const clickedYear = dateToCheck.getFullYear();
      const clickedMonth = dateToCheck.getMonth();
      const currentDisplayMonth = new Date(selectedYear, selectedMonth, 1);
      
      // Check if the clicked date is from a different month than currently displayed
      if (clickedYear !== currentDisplayMonth.getFullYear() || 
          clickedMonth !== currentDisplayMonth.getMonth()) {
        // Mark as internal update to prevent useEffect from resetting
        isInternalUpdate.current = true;
        
        // Update the calendar to show the month of the clicked date
        setSelectedYear(clickedYear);
        setSelectedMonth(clickedMonth);
        
        // Trigger month change handler
        handleMonthChange(new Date(clickedYear, clickedMonth, 1));
      }
    }
    
    // Call the original onSelect handler if provided
    if ('onSelect' in props && props.onSelect) {
      (props.onSelect as any)(selected);
    }
  };

  // Set toDate and fromDate to restrict calendar range if maxDate/minDate are provided
  // Always use selectedYear and selectedMonth for the calendar month, not props.month
  const { month: propsMonth, onSelect, ...restProps } = props as any;
  const calendarProps: any = {
    ...restProps,
    toDate: maxDate || props.toDate,
    fromDate: minDate || props.fromDate,
    onMonthChange: handleMonthChange,
    onSelect: handleSelect,
    // Force the calendar to use our internal state, overriding any month prop
    month: view === "day" ? new Date(selectedYear, selectedMonth, 1) : undefined,
  };

  // Sync selected month/year with props.month if provided (only when props.month changes externally)
  
  React.useEffect(() => {
    // Skip if this is an internal update (from month/year selection)
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    if (props.month) {
      const newYear = props.month.getFullYear();
      const newMonth = props.month.getMonth();
      // Only update if it's different from current selection to avoid overriding user selection
      if (newYear !== selectedYear || newMonth !== selectedMonth) {
        setSelectedYear(newYear);
        setSelectedMonth(newMonth);
        // Reset to day view when month changes externally
        if (view !== "day") {
          setView("day");
        }
      }
    } else if (!props.month && (selectedYear === undefined || selectedMonth === undefined)) {
      // Initialize with current date if no month prop and state is not set
      const now = new Date();
      setSelectedYear(now.getFullYear());
      setSelectedMonth(now.getMonth());
    }
  }, [props.month]); // Only depend on props.month, not view or selectedYear/selectedMonth

  // Add click handlers to caption label after render using event delegation
  const calendarRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (view === "day" && calendarRef.current) {
      const handleCaptionClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Check for data attributes first (our custom buttons)
        const button = target.closest('button[data-caption-part]') as HTMLElement;
        if (button) {
          const part = button.getAttribute('data-caption-part');
          const currentDisplayMonth = new Date(selectedYear, selectedMonth, 1);
          const currentYear = currentDisplayMonth.getFullYear();
          
          e.preventDefault();
          e.stopPropagation();
          
          if (part === 'month') {
            setSelectedYear(currentYear);
            setView("month");
          } else if (part === 'year') {
            setSelectedYear(currentYear);
            setView("year");
          }
          return;
        }
        
        // Fallback: check for caption label clicks
        const captionLabel = target.closest('[class*="caption_label"]') as HTMLElement;
        if (captionLabel) {
          const currentDisplayMonth = new Date(selectedYear, selectedMonth, 1);
          const currentYear = currentDisplayMonth.getFullYear();
          const monthText = format(currentDisplayMonth, "MMMM");
          const text = captionLabel.textContent || '';
          
          e.preventDefault();
          e.stopPropagation();
          
          if (text.includes(monthText) && text.trim().startsWith(monthText)) {
            setSelectedYear(currentYear);
            setView("month");
          } else if (text.includes(currentYear.toString())) {
            setSelectedYear(currentYear);
            setView("year");
          }
        }
      };

      const wrapper = calendarRef.current;
      wrapper.addEventListener('click', handleCaptionClick, true);
      return () => {
        wrapper.removeEventListener('click', handleCaptionClick, true);
      };
    }
  }, [view, selectedYear, selectedMonth]);

  return (
    <div className={cn("w-fit rounded-2xl bg-card/95 backdrop-blur-sm shadow-lg border border-border/50 p-4 transition-all duration-200", className)}>
      <AnimatePresence mode="wait">
        {view === "day" && (
          <motion.div
            key="day"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="calendar-wrapper" ref={calendarRef}>
    <DayPicker
      showOutsideDays={showOutsideDays}
      classNames={mergedClassNames}
      components={mergedComponents}
                {...calendarProps}
              />
            </div>
          </motion.div>
        )}
        {view === "month" && (
          <motion.div
            key="month"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <MonthView />
          </motion.div>
        )}
        {view === "year" && (
          <motion.div
            key="year"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <YearView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
