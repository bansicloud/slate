import * as Constants from "~/node_common/constants";
import * as Utilities from "~/node_common/utilities";
import * as Data from "~/node_common/data";

const generateLayout = (items) => {
  if (!items) {
    return [];
  }

  if (!items.length) {
    return [];
  }

  return items.map((item, i) => {
    var y = Math.ceil(Math.random() * 4) + 1;

    return {
      x: (i * 2) % 10,
      y: 0,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
      // NOTE(jim): Library quirk thats required.
      i: i.toString(),
    };
  });
};

export default async (req, res) => {
  const id = Utilities.getIdFromCookie(req);
  if (!id) {
    return res
      .status(403)
      .send({ decorator: "SERVER_ADD_TO_SLATE_USER_NOT_FOUND", error: true });
  }

  const user = await Data.getUserById({
    id,
  });

  if (!user) {
    return res.status(404).send({
      decorator: "SERVER_ADD_TO_SLATE_USER_NOT_FOUND",
      error: true,
    });
  }

  if (user.error) {
    return res.status(500).send({
      decorator: "SERVER_ADD_TO_SLATE_USER_NOT_FOUND",
      error: true,
    });
  }

  const slate = await Data.getSlateById({ id: req.body.slate.id });

  if (!slate) {
    return res.status(404).send({
      decorator: "SERVER_ADD_TO_SLATE_SLATE_NOT_FOUND",
      error: true,
    });
  }

  if (slate.error) {
    return res.status(500).send({
      decorator: "SERVER_ADD_TO_SLATE_SLATE_NOT_FOUND",
      error: true,
    });
  }

  const cid = req.body.data.ipfs.replace("/ipfs/", "");
  const objects = [
    ...slate.data.objects,
    {
      id: req.body.data.id,
      ownerId: user.id,
      name: req.body.data.name,
      title: req.body.data.title,
      type: req.body.data.type,
      url: `${Constants.IPFS_GATEWAY_URL}/${cid}`,
    },
  ];

  // TODO(jim): Preserve layouts when adding.
  let layouts = { lg: generateLayout(objects) };

  const update = await Data.updateSlateById({
    id: slate.id,
    updated_at: new Date(),
    data: {
      ...slate.data,
      layouts,
      objects,
    },
  });

  if (!update) {
    return res.status(500).send({
      decorator: "SERVER_ADD_TO_SLATE_ERROR",
      error: true,
    });
  }

  if (update.error) {
    return res.status(500).send({
      decorator: "SERVER_ADD_TO_SLATE_ERROR",
      error: true,
    });
  }

  return res
    .status(200)
    .send({ decorator: "SERVER_SLATE_ADD_TO_SLATE", slate });
};
