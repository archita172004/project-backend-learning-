import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  if (!req.user) {
    throw new ApiError(401, "User not logged in");
  }
  const sortOrder = sortType == "asc" ? 1 : -1;

  const match = {};
  if (query) {
    match.title = { $regex: query, $options: "i" };
  }

  if (userId) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const videos = await Video.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videosByOwner",
      },
    },
    {
      $project: {
        thumbnail: 1,
        videoFile: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: {
          $arrayElemAt: ["videosByOwner", 0],
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortOrder,
      },
    },
    {
      $skip: (page - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!videos?.length) {
    throw new ApiError(404, "no videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId).populate("owner", "name email");

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, "video not found"));
  }
  console.log(video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "video fetched using video id successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "not a valid videoId");
  }
  const updatedPayload = {
    title,
    description,
  };

  if (req.file) {
    const thumbnailLocalpath = req.file.path;

    if (!thumbnailLocalpath) {
      throw new ApiError(400, "thumbnail is missing");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath);

    if (!thumbnail.url) {
      throw new ApiError(400, "Error while uploading the file on cloudinary");
    }

    updatedPayload.thumbnail = thumbnail;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...updatedPayload,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "video file updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const delVideo = await Video.findByIdAndDelete(videoId);

  if (!delVideo) {
    throw new ApiError(400, "video not found");
  }

  return res
    .status(200)
    .json(new ApiError(200, delVideo, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const changedStatus = await Video.findOneAndUpdate(
    { _id: videoId },
    {
      $set: {
        isPublished: { $not: "$isPublished" },
      },
    },
    { new: true }
  );
  if (!changedStatus) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, changedStatus, "Publish status toggled successfully")
    );
});

export {
  getVideoById,
  getAllVideos,
  publishAVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
