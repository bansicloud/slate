import * as React from "react";
import * as Actions from "~/common/actions";
import * as Constants from "~/common/constants";
import * as System from "~/components/system";
import * as Strings from "~/common/strings";

import { css } from "@emotion/react";
import { dispatchCustomEvent } from "~/common/custom-events";
import { ButtonWarning } from "~/components/system/components/Buttons";

const STYLES_GROUP = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  margin-top: 8px;
`;

const STYLES_HEADER = css`
  font-family: ${Constants.font.semiBold};
  font-size: 18px;
  margin-top: 48px;
`;

export default class SidebarSingleSlateSettings extends React.Component {
  state = {
    slatename: this.props.current.slatename,
    public: this.props.current.data.public,
    body: this.props.current.data.body,
    name: this.props.current.data.name,
    loading: false,
  };

  _handleSubmit = async () => {
    this.setState({ loading: true });

    const response = await Actions.updateSlate({
      id: this.props.current.id,
      data: {
        name: this.state.name,
        public: this.state.public,
        body: this.state.body,
      },
    });

    if (!response) {
      dispatchCustomEvent({
        name: "create-alert",
        detail: {
          alert: {
            message:
              "We're having trouble connecting right now. Please try again later",
          },
        },
      });
      return this.setState({ loading: false });
    }

    if (response.error) {
      dispatchCustomEvent({
        name: "create-alert",
        detail: { alert: { decorator: response.decorator } },
      });
      return this.setState({ loading: false });
    }

    await this.props.onSubmit({});
  };

  _handleCancel = () => {
    this.props.onCancel();
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  _handleDelete = async (e) => {
    this.setState({ loading: true });

    if (
      !window.confirm(
        "Are you sure you want to delete this Slate? This action is irreversible."
      )
    ) {
      return this.setState({ loading: false });
    }

    const response = await Actions.deleteSlate({
      id: this.props.current.id,
    });

    if (!response) {
      dispatchCustomEvent({
        name: "create-alert",
        detail: {
          alert: {
            message:
              "We're having trouble connecting right now. Please try again later",
          },
        },
      });
      return this.setState({ loading: false });
    }

    if (response.error) {
      dispatchCustomEvent({
        name: "create-alert",
        detail: { alert: { decorator: response.decorator } },
      });
      return this.setState({ loading: false });
    }

    await this.props.onAction({
      type: "NAVIGATE",
      value: "V1_NAVIGATION_SLATES",
    });

    return await this.props.onRehydrate();
  };

  render() {
    console.log(this.props);
    const slug = Strings.createSlug(this.state.name);
    const url = `/${this.props.viewer.username}/${slug}`;

    return (
      <React.Fragment>
        <System.P
          style={{
            fontFamily: Constants.font.semiBold,
            fontSize: Constants.typescale.lvl3,
            marginBottom: 64,
          }}
        >
          Slate settings
        </System.P>

        <System.P css={STYLES_HEADER}>Name</System.P>
        <System.P
          style={{
            marginTop: 12,
          }}
        >
          Changing the slatename will change your public slate URL. Your slate
          URL is:{" "}
          <a href={url} target="_blank">
            https://slate.host{url}
          </a>
        </System.P>
        <System.Input
          placeholder="Slate name..."
          style={{ marginTop: 24 }}
          name="name"
          value={this.state.name}
          placeholder="Name"
          onChange={this._handleChange}
          onSubmit={this._handleSubmit}
          descriptionStyle={{ fontSize: "20px !important" }}
          labelStyle={{ fontSize: "20px" }}
        />

        <System.P css={STYLES_HEADER}>Description</System.P>

        <System.Textarea
          style={{ marginTop: 12 }}
          name="body"
          value={this.state.body}
          placeholder="A slate."
          onChange={this._handleChange}
          onSubmit={this._handleSubmit}
        />

        <System.P css={STYLES_HEADER} style={{ marginTop: 48 }}>
          Privacy
        </System.P>
        <div css={STYLES_GROUP}>
          <System.P>{this.state.public ? "Public" : "Private"}</System.P>
          <System.Toggle
            name="public"
            onChange={this._handleChange}
            active={this.state.public}
          />
        </div>

        <div style={{ marginTop: 40 }}>
          <System.ButtonPrimary
            full
            onClick={this._handleSubmit}
            loading={this.state.loading}
          >
            Save changes
          </System.ButtonPrimary>

          {!this.state.loading ? (
            <ButtonWarning
              style={{
                marginTop: 16,
              }}
              full
              onClick={this._handleCancel}
            >
              Cancel
            </ButtonWarning>
          ) : null}
        </div>

        {!this.state.loading ? (
          <div style={{ marginTop: 48 }}>
            <ButtonWarning
              full
              onClick={this._handleDelete}
              loading={this.state.loading}
              style={{ overflow: "hidden" }}
            >
              Delete{" "}
              {this.props.current.data && this.props.current.data.name
                ? this.props.current.data.name
                : this.props.current.slatename}
            </ButtonWarning>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}
