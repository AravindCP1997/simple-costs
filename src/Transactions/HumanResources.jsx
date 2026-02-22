import { useEffect, useState } from "react";
import {
  Label,
  Input,
  Option,
  Radio,
  CheckBox,
  Button,
  ConditionalButton,
  WindowTitle,
  WindowContent,
  DisplayArea,
  Row,
  Column,
  Table,
  AutoSuggestInput,
  HidingDisplay,
  Conditional,
  MultiDisplayArea,
  Selection,
  ConditionalDisplay,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  monthBegin,
  monthEnd,
  rangeOverlap,
  trimSelection,
} from "../functions";

export function HumanResources() {
  return (
    <>
      <WindowTitle title={"Human Resources"} closeTo="System" />
      <WindowContent>
        <DisplayArea>
          <Label
            style={{ fontWeight: "bold" }}
            label={"The Human Resources Process in Compounds"}
          />
          <p>
            The core steps involved in the human resources process-flow include:
            <ul>
              <li>
                Calculation of remuneration of employees, for a period (month)
                or an interim date (off-cycle date),
              </li>
              <li>
                Recognising expense and liability in financial accounts for the
                remuneration due,
              </li>
              <li>
                Creating cost records for the remuneration of each employee,
                being cost objects, and for every wage type identified as cost
                elements, and
              </li>
              <li>
                Recognising payment in financial accounts and generating payment
                files.
              </li>
            </ul>
          </p>
          <p>
            The following data collections are necessary for performing the
            human resources process.
          </p>
          <Column bg="var(--lightbluet)" padding="5px">
            <Label label={"Global"} style={{ fontWeight: "bold" }} />
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label
                label={"Chart of Accounts"}
                style={{ fontWeight: "bold" }}
              />
              <p>
                Chart of Accounts primarily define the Account Groups and
                numbering of General Ledgers.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
              <Label label={"Segment"} style={{ fontWeight: "bold" }} />
              <p>
                Performance reporting unit. Profit centers are assigned to
                Segments.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label label={"Income Tax Code"} style={{ fontWeight: "bold" }} />
              <p>
                Income Tax Code defines the taxation of employee remuneration,
                and calculation of withholding tax.
              </p>
            </Column>
          </Column>
          <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
            <Label label={"Company Level"} style={{ fontWeight: "bold" }} />
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label label={"Company"} style={{ fontWeight: "bold" }} />
              <p>
                The base organisational structure. All collections, except the
                Global are created for a company.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
              <Label label={"General Ledger"} style={{ fontWeight: "bold" }} />
              <p>
                Financial Account.{" "}
                <i>
                  Accounting is the systematic process of recording, organizing,
                  analyzing, and reporting financial transactions to evaluate
                  performance and position.
                </i>
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label label={"Wage Type"} style={{ fontWeight: "bold" }} />
              <p>
                Core element of remuneration calculation. Distinguishes between
                emoluments and deductions, taxable and non-taxable remuneration.
                Determines if remuneration is a cost reportable element. Also
                determines general ledger to which remuneration is recognised as
                expense.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
              <Label label={"Employee Group"} style={{ fontWeight: "bold" }} />
              <p>
                Aggregates employees having shared charecteristics. Determines
                the general ledger for accrued remuneration or payables to the
                employees, as well as general ledger for withholding tax.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label label={"Employee"} style={{ fontWeight: "bold" }} />
              <p>
                Collects personal, organisational, remuneration, tax and payment
                information specific to an employee.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
              <Label label={"Holidays"} style={{ fontWeight: "bold" }} />
              <p>
                Holidays for an year, as applicable to the company. Remuneration
                will be calculated for a declared holiday, without considering
                attendance of the employee.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label label={"Bank Account"} style={{ fontWeight: "bold" }} />
              <p>
                Bank account of the company. Used for payment of remuneration.
                Defines general ledger to be credited or debited in the case or
                payment or receipt, respectively.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
              <Label label={"Attendance"} style={{ fontWeight: "bold" }} />
              <p>
                Recorded for each employee. Determines the inclusion of variable
                wages in the remuneration calculation of a period.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightgreent)" padding="5px">
              <Label label={"Profit Center"} style={{ fontWeight: "bold" }} />
              <p>
                Performance reporting unit within a company. Holds one-to-many
                relationships with Cost Centers, Locations, Plants and Revenue
                Centers. Every general ledger entry is attributed to a Profit
                Center.
              </p>
            </Column>
            <Column borderBottom="none" bg="var(--lightbluet)" padding="5px">
              <Label
                label={"Cost Center, Location, Plant and Revenue Center"}
                style={{ fontWeight: "bold" }}
              />
              <p>
                Organisational units which are also cost objects. Locations hold
                materials. Plants manufacture or assemble goods. Revenue centers
                generate revenue through sale of goods and services. Cost
                centers are residual category of organisational units which are
                not Locations, Plants or Revenue Centers, but consume goods and
                services.
              </p>
            </Column>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
